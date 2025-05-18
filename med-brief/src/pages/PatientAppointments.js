import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

function PatientAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const q = query(
        collection(firestore, 'appointments'),
        where('patient_id', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      setAppointments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchAppointments();
  }, [currentUser]);

  // Safely handle appointment time rendering
  const renderAppointmentTime = (appointment) => {
    const appointmentTimeString = appointment.appointment_time; // Expecting ISO string

    if (appointmentTimeString) {
      const dateTime = new Date(appointmentTimeString);

      if (!isNaN(dateTime.getTime())) {
        return dateTime.toLocaleString(); // Format according to the user's locale
      }
    }

    return 'Appointment time not available';
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Your Appointments
      </h1>
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800">
                Doctor: {appointment.doctor_name || 'Unknown Doctor'}
              </h3>
              <p className="text-gray-600">Status: {appointment.status}</p>
              <p className="text-gray-600">
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
              <h4 className="mt-4 text-lg font-semibold text-gray-700">
                Prescriptions:
              </h4>
              <ul className="list-disc pl-5">
                {appointment.prescriptions && appointment.prescriptions.length > 0 ? (
                  appointment.prescriptions.map((prescription, index) => (
                    <li key={index} className="text-gray-600">
                      <strong>{prescription.name}</strong> - {prescription.dosage} (
                      {prescription.instructions})
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No prescriptions available</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientAppointments;
