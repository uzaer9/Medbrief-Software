import { firestore, storage } from '../firebase/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { transcribeAudio } from '../api/assemblyAI';
import { summarizeAndExtractPrescription } from '../api/gemini';
import React, { useEffect, useState, useRef } from 'react';

function DoctorAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const q = query(
      collection(firestore, 'appointments'),
      where('doctor_id', '==', currentUser.uid),
      where('status', 'in', ['pending', 'approved'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedAppointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(updatedAppointments);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleApprove = async (appointmentId, doctorId, slotIndex) => {
    try {
      const appointmentRef = doc(firestore, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'approved' });

      const doctorRef = doc(firestore, 'users', doctorId);
      const doctorDoc = await getDoc(doctorRef);
      const doctorData = doctorDoc.data();

      doctorData.availableSlots[slotIndex].status = 'booked';
      await updateDoc(doctorRef, { availableSlots: doctorData.availableSlots });

      alert('Appointment approved and slot booked');
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleDecline = async (appointmentId) => {
    try {
      const appointmentRef = doc(firestore, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'declined' });

      alert('Appointment declined');
    } catch (error) {
      console.error('Error declining appointment:', error);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
    }).catch((err) => {
      console.error("Error accessing microphone: ", err);
      alert("Error accessing microphone!");
    });
  };

  const stopRecording = async (appointmentId) => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `appointment_${appointmentId}.webm`, { type: 'audio/webm' });
      audioChunksRef.current = [];

      await handleAudioUpload(audioFile, appointmentId);
    };
  };

  const handleAudioUpload = async (audioFile, appointmentId) => {
    try {
      setIsLoading(true);

      const storageRef = ref(storage, `appointments/${appointmentId}/audio`);
      await uploadBytes(storageRef, audioFile);
      const audioUrl = await getDownloadURL(storageRef);

      const { transcript } = await transcribeAudio(audioUrl);
      const { summary, medicines } = await summarizeAndExtractPrescription(transcript);

      const appointmentRef = doc(firestore, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        transcription: transcript,
        summary,
        prescriptions: medicines,
        status: 'completed',
      });

      alert('Audio uploaded and appointment details updated!');
    } catch (error) {
      console.error('Error during audio upload:', error);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="max-w-full mx-auto p-6 bg-gradient-to-b from-white to-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-900 mb-8">Your Appointments</h1>
      {appointments.length === 0 ? (
        <p className="text-gray-600">No appointments found.</p>
      ) : (
        appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-xl font-medium text-gray-800 mb-2">Patient: {appointment.patient_id}</h3>
            <p className="text-gray-600">Reason: {appointment.reason}</p>
            <p className="text-gray-600">Status: {appointment.status}</p>
            <p className="text-gray-600">Appointment Time: {renderAppointmentTime(appointment)}</p>

            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleApprove(appointment.id, appointment.doctor_id, appointment.slotIndex)}
                disabled={appointment.status === 'approved' || appointment.status === 'declined'}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-150 ${
                  appointment.status === 'approved'
                    ? 'bg-green-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } disabled:opacity-50`}
              >
                {appointment.status === 'approved' ? 'Approved' : 'Approve'}
              </button>
              <button
                onClick={() => handleDecline(appointment.id)}
                disabled={appointment.status === 'approved' || appointment.status === 'declined'}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-150 ${
                  appointment.status === 'declined'
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                } disabled:opacity-50`}
              >
                {appointment.status === 'declined' ? 'Declined' : 'Decline'}
              </button>
            </div>

            {appointment.status === 'approved' && (
              <div className="mt-4">
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-150 ${
                    isRecording ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {isRecording ? 'Recording...' : 'Start Appointment (Record Live Audio)'}
                </button>
                <button
                  onClick={() => stopRecording(appointment.id)}
                  disabled={!isRecording}
                  className="ml-2 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-150 disabled:opacity-50"
                >
                  Stop Recording
                </button>
              </div>
            )}

            {appointment.status === 'approved' && (
              <div className="mt-4">
                <input
                  type="file"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  className="block mb-2 bg-gray-50 border border-gray-300 rounded-md p-2"
                />
                <button
                  onClick={() => handleAudioUpload(audioFile, appointment.id)}
                  disabled={isLoading || !audioFile || isRecording}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Upload Audio'}
                </button>
              </div>
            )}

            {appointment.status === 'completed' && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800">Transcription:</h4>
                <p className="text-gray-600">{appointment.transcription}</p>
                <h4 className="font-semibold text-gray-800 mt-2">Summary:</h4>
                <p className="text-gray-600">{appointment.summary}</p>
                <h4 className="font-semibold text-gray-800 mt-2">Prescriptions:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {appointment.prescriptions.map((prescription, index) => (
                    <li key={index}>
                      {prescription.name} - {prescription.dosage} ({prescription.instructions})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default DoctorAppointments;
