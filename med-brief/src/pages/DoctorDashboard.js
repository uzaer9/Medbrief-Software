import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';

function DoctorDashboard() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      const doctorDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      if (doctorDoc.exists()) {
        setDoctor(doctorDoc.data());
      }

      const appointmentQuery = query(collection(firestore, 'appointments'), where('doctor_id', '==', currentUser.uid));
      const snapshot = await getDocs(appointmentQuery);
      const fetchedAppointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const uniquePatientIds = new Set();
      fetchedAppointments.forEach((appointment) => uniquePatientIds.add(appointment.patient_id));

      const patientDetails = await Promise.all(
        Array.from(uniquePatientIds).map(async (patientId) => {
          const patientDoc = await getDoc(doc(firestore, 'users', patientId));
          return patientDoc.exists() ? { id: patientDoc.id, ...patientDoc.data() } : null;
        })
      );

      setPatients(patientDetails.filter((patient) => patient !== null));
      setAppointments(fetchedAppointments);
    };

    fetchData();
  }, [currentUser]);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };
  

  const generatePrescriptionPDF = (appointment) => {
    const pdfData = {
      clinicName: doctor?.clinicName || "Clinic Name Not Available",
      clinicAddress: doctor?.clinicAddress || "Clinic Address Not Available",
      clinicEmail: doctor?.email || "N/A",
      doctorName: doctor?.fullName || "N/A",
      doctorContact: doctor?.phone || "N/A",
      doctorSpecialization: doctor?.specialization || "N/A",
      degrees: doctor?.degrees || "N/A",  
      experience: doctor?.experience || "N/A",
      patientName: selectedPatient?.fullName || "N/A",
  
      // Calculate age inline based on patient.dob
      patientAge: selectedPatient?.dob
        ? Math.floor(
            (new Date() - new Date(selectedPatient.dob)) / (365.25 * 24 * 60 * 60 * 1000)
          )
        : 'N/A',
  
      patientGender: selectedPatient?.gender || 'N/A',
      appointmentDate: formatDate(appointment?.appointment_time),
      prescriptions: appointment?.prescriptions || [],
      appointmentSummary: appointment?.summary || "No summary provided."
    };
  
    const doc = new jsPDF();
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);
    doc.setFontSize(24);
    doc.text(pdfData.clinicName, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(pdfData.clinicAddress, 105, 30, { align: 'center' });
    doc.text(`${pdfData.clinicEmail} | ${pdfData.doctorContact}`, 105, 35, { align: 'center' });
  
    doc.setFontSize(10);
    const rightAlignedX = 145;
    const doctorInfoStartY = 45;
    doc.text(`Dr. ${pdfData.doctorName}`, rightAlignedX, doctorInfoStartY);
    doc.text(`Specialization: ${pdfData.doctorSpecialization}`, rightAlignedX, doctorInfoStartY + 5);
    doc.text(`Degrees: ${pdfData.degrees}`, rightAlignedX, doctorInfoStartY + 10);
    doc.text(`Experience: ${pdfData.experience} years`, rightAlignedX, doctorInfoStartY + 15);
  
    const patientInfoStartY = doctorInfoStartY + 25;
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
  
    const prescriptionsStartY = doc.autoTable.previous.finalY + 10;
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
  
    const summaryStartY = doc.autoTable.previous.finalY + 10;
    doc.setFontSize(12);
    doc.text("Summary:", 14, summaryStartY);
    doc.setFontSize(10);
    const pageWidth = 180;
    const splitSummary = doc.splitTextToSize(pdfData.appointmentSummary, pageWidth);
    doc.text(splitSummary, 14, summaryStartY + 10);
  
    doc.setFontSize(10);
    doc.text("Clinic Slogan Here!", 105, 280, { align: 'center' });
    doc.save(`${pdfData.patientName}_Prescription.pdf`);
  };
  

  const formatDate = (appointment_time) => {
    return appointment_time ? new Date(appointment_time).toLocaleString() : "Not Available";
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-r from-blue-50 to-gray-50">
      <div className="flex-1 px-6 py-4">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Doctor's Dashboard</h2>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-white rounded-xl shadow-xl text-center">
            <p className="text-4xl font-bold text-blue-600">{appointments.length}</p>
            <p className="text-lg text-gray-600">Appointments</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-xl text-center">
            <p className="text-4xl font-bold text-green-600">{patients.length}</p>
            <p className="text-lg text-gray-600">Patients</p>
          </div>
        </div>

        {selectedPatient ? (
          <PatientDetail
            patient={selectedPatient}
            doctor={doctor}
            appointments={appointments.filter((app) => app.patient_id === selectedPatient.id)}
            onBack={() => setSelectedPatient(null)}
            onGeneratePDF={generatePrescriptionPDF}
          />
        ) : (
          <PatientList patients={patients} onPatientClick={handlePatientClick} />
        )}
      </div>
    </div>
  );
}

function PatientList({ patients, onPatientClick }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Patients</h2>
      {patients.length === 0 ? (
        <p className="text-gray-600">No patients found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => onPatientClick(patient)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PatientCard({ patient, onClick }) {
  return (
    <div
      className="p-5 bg-white rounded-xl shadow-md hover:shadow-xl cursor-pointer transform transition duration-200 hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* If profile photo exists, display it, otherwise fallback to initials */}
        {patient.profilePhotoUrl ? (
          <img
            src={patient.profilePhotoUrl}
            alt={`${patient.fullName}'s profile`}
            className="rounded-full h-20 w-20 object-cover"
          />
        ) : (
          <div className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-500 to-green-500 text-white flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {patient.fullName?.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {patient.fullName || 'Name Not Available'}
          </h3>

          {/* Calculate the age inline based on DOB */}
          <p className="text-gray-600">
            Age:{' '}
            {patient.dob
              ? Math.floor(
                  (new Date() - new Date(patient.dob)) / (365.25 * 24 * 60 * 60 * 1000)
                )
              : 'N/A'}
          </p>

          <p className="text-gray-600">Gender: {patient.gender || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

function PatientDetail({ patient, doctor, appointments, onBack, onGeneratePDF }) {
  return (
    <div className="bg-white p-8 shadow-xl w-full">
      <button onClick={onBack} className="text-blue-500 mb-4">← Back to Patients</button>

      {/* Patient Profile Header */}
      <div className="flex items-center mb-6">
        {/* Profile Photo */}
        {patient.profilePhotoUrl ? (
          <img
            src={patient.profilePhotoUrl}
            alt={`${patient.fullName}'s profile`}
            className="rounded-full h-24 w-24 object-cover mr-6"
          />
        ) : (
          <div className="rounded-full h-24 w-24 bg-gray-300 flex items-center justify-center mr-6">
            <span className="text-2xl font-bold text-gray-600">
              {patient.fullName?.charAt(0)}
            </span>
          </div>
        )}

        {/* Patient Info */}
        <div>
          <h2 className="text-4xl font-semibold text-gray-800">{patient.fullName || 'Name Not Available'}</h2>
          
          {/* Age calculated inline */}
          <p className="text-lg text-gray-600">
            Age: {patient.dob
              ? Math.floor(
                  (new Date() - new Date(patient.dob)) / (365.25 * 24 * 60 * 60 * 1000)
                )
              : 'N/A'}
          </p>
          <p className="text-lg text-gray-600">Gender: {patient.gender || 'N/A'}</p>
        </div>
      </div>

      {/* Patient Details Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700">Phone Number</h4>
          <p className="text-gray-600">{patient.phone || 'N/A'}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700">Blood Group</h4>
          <p className="text-gray-600">{patient.bloodGroup || 'N/A'}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700">Known Allergies</h4>
          <p className="text-gray-600">{patient.allergies || 'None'}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700">Chronic Conditions</h4>
          <p className="text-gray-600">{patient.chronicConditions || 'None'}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700">Past Surgeries</h4>
          <p className="text-gray-600">{patient.pastSurgeries || 'None'}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700">Current Medications</h4>
          <p className="text-gray-600">{patient.currentMedications || 'None'}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700">Family Medical History</h4>
          <p className="text-gray-600">{patient.familyHistory || 'None'}</p>
        </div>
      </div>

      {/* Appointments Section */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Appointments</h3>
      {appointments.length === 0 ? (
        <p className="text-gray-600">No appointments found for this patient.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onGeneratePDF={onGeneratePDF}
            />
          ))}
        </ul>
      )}
    </div>
  );
}



function AppointmentCard({ appointment, onGeneratePDF }) {
  return (
    <li className="bg-gray-100 p-4 mb-2 rounded-lg">
      <p><strong>Date:</strong> {new Date(appointment.appointment_time).toLocaleString()}</p>
      <p><strong>Summary:</strong> {appointment.summary || "No summary provided."}</p>
      <button onClick={() => onGeneratePDF(appointment)} className="mt-2 text-blue-600 hover:underline">Generate Prescription PDF</button>
    </li>
  );
}

export default DoctorDashboard;
