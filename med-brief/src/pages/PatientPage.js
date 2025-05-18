import React, { useEffect, useState } from 'react'; 
import { firestore } from '../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function PatientPage() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [patients, setPatients] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      const q = query(
        collection(firestore, 'appointments'),
        where('patient_id', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const appointmentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(appointmentData);
      await fetchDoctorsAndPatients(appointmentData);
    };

    fetchAppointments();
  }, [currentUser]);

  const fetchDoctorsAndPatients = async (appointments) => {
    const doctorIds = [...new Set(appointments.map((appointment) => appointment.doctor_id))];
    const patientIds = [...new Set(appointments.map((appointment) => appointment.patient_id))];

    const doctorPromises = doctorIds.map(async (doctorId) => {
      const doctorDoc = await getDoc(doc(firestore, 'users', doctorId));
      return doctorDoc.exists() ? { id: doctorDoc.id, ...doctorDoc.data() } : null;
    });

    const doctorData = await Promise.all(doctorPromises);
    const doctorMap = doctorData.reduce((acc, doctor) => {
      if (doctor) acc[doctor.id] = doctor;
      return acc;
    }, {});
    setDoctors(doctorMap);

    const patientPromises = patientIds.map(async (patientId) => {
      const patientDoc = await getDoc(doc(firestore, 'users', patientId));
      return patientDoc.exists() ? { id: patientDoc.id, ...patientDoc.data() } : null;
    });

    const patientData = await Promise.all(patientPromises);
    const patientMap = patientData.reduce((acc, patient) => {
      if (patient) acc[patient.id] = patient;
      return acc;
    }, {});
    setPatients(patientMap);
  };

  const renderAppointmentTime = (appointment) => {
    const appointmentTimeString = appointment.appointment_time;

    if (appointmentTimeString) {
      const dateTime = new Date(appointmentTimeString);
      if (!isNaN(dateTime.getTime())) {
        return dateTime.toLocaleString();
      }
    }
    return 'Appointment time not available';
  };

  const generatePrescriptionPDF = (appointment, doctor, patient) => {
    const pdfData = {
      clinicName: doctor?.clinicName || "Clinic Name Not Available",
      clinicAddress: doctor?.clinicAddress || "Clinic Address Not Available",
      clinicEmail: doctor?.email || "N/A",
      doctorName: doctor?.fullName || "N/A",
      doctorContact: doctor?.phone || "N/A",
      doctorSpecialization: doctor?.specialization || "N/A",
      degrees: doctor?.degrees || "N/A",
      experience: doctor?.experience || "N/A",
      patientName: patient?.fullName || "N/A",
      patientAge: patient?.age || 'N/A',
      patientGender: patient?.gender || 'N/A',
      appointmentDate: formatDate(appointment?.appointment_time),
      prescriptions: appointment?.prescriptions || [],
      appointmentSummary: appointment?.summary || "No summary provided."
    };

    const doc = new jsPDF();

    // Add border to the page
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);  // 190 width, 277 height with padding

    // Clinic Name Header (Centered)
    doc.setFontSize(24);
    doc.text(pdfData.clinicName, 105, 20, { align: 'center' });

    // Clinic Address and Contact (Centered)
    doc.setFontSize(10);
    doc.text(pdfData.clinicAddress, 105, 30, { align: 'center' });
    doc.text(`${pdfData.clinicEmail} | ${pdfData.doctorContact}`, 105, 35, { align: 'center' });

    // Doctor's Information (Positioned to avoid overflow)
    doc.setFontSize(10);
    const rightAlignedX = 145; // Move the details more to the left to avoid overflow
    const doctorInfoStartY = 45;
    doc.text(`Dr. ${pdfData.doctorName}`, rightAlignedX, doctorInfoStartY);
    doc.text(`Specialization: ${pdfData.doctorSpecialization}`, rightAlignedX, doctorInfoStartY + 5);
    doc.text(`Degrees: ${pdfData.degrees}`, rightAlignedX, doctorInfoStartY + 10);
    doc.text(`Experience: ${pdfData.experience} years`, rightAlignedX, doctorInfoStartY + 15);

    // Increase spacing between doctor info and patient details
    const patientInfoStartY = doctorInfoStartY + 25;

    // Patient Info Table
    autoTable(doc, {
      startY: patientInfoStartY,
      theme: 'plain',
      styles: { fontSize: 10 },
      body: [
        ['Patient:', pdfData.patientName],
        ['Age:', pdfData.patientAge],
        ['Gender:', pdfData.patientGender],
        ['Appointment Date:', pdfData.appointmentDate],
      ],
    });

    // Add some space between Patient Info and the Prescription Table
    const prescriptionsStartY = doc.autoTable.previous.finalY + 10;

    // Prescription Table
    if (pdfData.prescriptions.length > 0) {
      autoTable(doc, {
        startY: prescriptionsStartY,
        head: [['Medicine', 'Dosage', 'Purpose', 'Usage Instructions']],
        body: pdfData.prescriptions.map((prescription) => [
          prescription.name || "N/A",
          prescription.dosage || "N/A",
          prescription.purpose || "N/A",
          prescription.usage_instructions || "N/A",
        ]),
      });
    }

    // Add some space before the summary section
    const summaryStartY = doc.autoTable.previous.finalY + 10;

    // Summary Section
    doc.setFontSize(12);
    doc.text("Summary:", 14, summaryStartY);

    doc.setFontSize(10);
    const pageWidth = 180;
    const splitSummary = doc.splitTextToSize(pdfData.appointmentSummary, pageWidth);
    doc.text(splitSummary, 14, summaryStartY + 10);

    // Footer
    doc.setFontSize(10);
    doc.text("Clinic Slogan Here!", 105, 280, { align: 'center' });

    // Save the PDF
    doc.save(`${pdfData.patientName}_Prescription.pdf`);
  };

  const formatDate = (appointment_time) => {
    return appointment_time ? new Date(appointment_time).toLocaleString() : "Not Available";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Patient Dashboard</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Appointments</h2>
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found.</p>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800">
                Doctor: {doctors[appointment.doctor_id] ? doctors[appointment.doctor_id].fullName : 'Loading...'}
              </h3>
              <p className="text-gray-600 mt-2">
                Appointment Time: {renderAppointmentTime(appointment)}
              </p>
              {appointment.transcription && (
                <p className="text-gray-600 mt-2">
                  <strong>Transcription:</strong> {appointment.transcription}
                </p>
              )}
              {appointment.summary && (
                <p className="text-gray-600 mt-2">
                  <strong>Summary:</strong> {appointment.summary}
                </p>
              )}
              <h4 className="mt-4 text-lg font-semibold text-gray-700">Prescriptions:</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {appointment.prescriptions && appointment.prescriptions.length > 0 ? (
                  appointment.prescriptions.map((prescription, index) => (
                    <li key={index}>
                      <strong>{prescription.name}</strong> - {prescription.dosage} (
                      {prescription.usage_instructions})
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No prescriptions available.</li>
                )}
              </ul>
              {/* Conditional rendering for the Download Prescription button */}
              {appointment.prescriptions && appointment.prescriptions.length > 0 && (
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => generatePrescriptionPDF(appointment, doctors[appointment.doctor_id], patients[currentUser.uid])}
                >
                  Download Prescription
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientPage;
