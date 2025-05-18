// src/components/DoctorList.js
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, onSnapshot, updateDoc, doc, addDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import addDays from 'date-fns/addDays';
import Modal from './Modal';
import DoctorCard from './DoctorCard'; // Import the DoctorCard component

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();

  // Fetch doctors and their available slots from Firebase using onSnapshot for real-time updates
  useEffect(() => {
    const fetchDoctors = () => {
      const doctorList = [];
      const unsubscribe = onSnapshot(collection(firestore, 'users'), (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role === 'doctor') {
            doctorList.push({ id: doc.id, ...data });
          }
        });
        setDoctors(doctorList); // Update doctors state with real-time data
      });

      // Cleanup the listener when the component unmounts
      return () => unsubscribe();
    };
    
    fetchDoctors();
  }, []);

  // Booking appointment and updating the slot in Firebase
  const handleBookSlot = async (doctorId, slotIndex) => {
    try {
      const doctorRef = doc(firestore, 'users', doctorId);
      const doctorDoc = await getDoc(doctorRef);
      const doctorData = doctorDoc.data();

      const selectedSlot = doctorData.availableSlots[slotIndex];
      const appointmentTime = new Date(`${selectedSlot.date} ${selectedSlot.start}`);

      // Update the slot status to 'booked'
      doctorData.availableSlots[slotIndex].status = 'booked';
      await updateDoc(doctorRef, { availableSlots: doctorData.availableSlots });

      // Save the appointment details
      await addDoc(collection(firestore, 'appointments'), {
        doctor_id: doctorId,
        patient_id: currentUser.uid,
        doctor_name: doctorData.fullName,
        patient_name: currentUser.displayName,
        appointment_time: appointmentTime.toISOString(),
        appointment_duration: 30,
        status: 'pending',
        slot: selectedSlot,
      });

      alert('Appointment booked successfully!');
      setIsModalOpen(false); // Close modal after booking
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  // Generate next 7 days for date selection
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Available Doctors</h1>
      {doctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors available.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBookAppointment={() => {
                setSelectedDoctor(doctor);
                setIsModalOpen(true); // Open modal
              }}
            />
          ))}
        </div>
      )}

      {/* Render modal for booking */}
      <Modal
        isOpen={isModalOpen}
        doctor={selectedDoctor}
        selectedDate={selectedDate}
        nextSevenDays={nextSevenDays}
        setSelectedDate={setSelectedDate}
        handleBookSlot={handleBookSlot}
        closeModal={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default DoctorList;
