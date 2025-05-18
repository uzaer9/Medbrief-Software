// src/pages/DoctorPage.js
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

function DoctorPage() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const q = query(collection(firestore, 'appointments'), where('doctor_id', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const patientData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(patientData);
    };

    fetchPatients();
  }, [currentUser]);

  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <h2>Your Patients</h2>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        patients.map((patient) => (
          <div key={patient.id}>
            <h3>Patient ID: {patient.patient_id}</h3>
            <p>Appointment Time: {new Date(patient.appointment_time.seconds * 1000).toLocaleString()}</p>
            {patient.transcription && <p>Transcription: {patient.transcription}</p>}
            {patient.summary && <p>Summary: {patient.summary}</p>}
          </div>
        ))
      )}
    </div>
  );
}

export default DoctorPage;
