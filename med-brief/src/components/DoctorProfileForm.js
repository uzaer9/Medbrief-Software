

import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { format, addMinutes, parse } from 'date-fns';
// eslint-disable-next-line no-unused-vars
import { FaTimes, FaCloudUploadAlt, FaCalendarAlt, FaCheckCircle, FaBan } from 'react-icons/fa';

export default function DoctorProfileForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dob: '',
    email: '',
    phone: '',
    degrees: '',
    experience: '',
    specialization: '',
    clinicName: '',
    clinicAddress: '',
    availableSlots: [],
    profilePictureUrl: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00' });
  const [slotDuration, setSlotDuration] = useState(30);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Fetch doctor profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const profileDoc = doc(firestore, 'users', currentUser.uid);
        const profileSnap = await getDoc(profileDoc);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          setFormData({
            ...profileData,
            availableSlots: profileData.availableSlots || [],
            profilePictureUrl: profileData.profilePictureUrl || '',
          });
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target;
    setWorkingHours((prev) => ({ ...prev, [name]: value }));
  };

  // Generate available slots based on working hours and slot duration
  const generateSlots = () => {
    const slots = [];
    const startTime = parse(workingHours.start, 'HH:mm', new Date());
    const endTime = parse(workingHours.end, 'HH:mm', new Date());
    let currentSlot = startTime;

    if (formData.availableSlots.some(slot => slot.date === format(selectedDate, 'yyyy-MM-dd'))) {
      alert('Slots for this date are already created.');
      return;
    }

    while (currentSlot < endTime) {
      const slotEnd = addMinutes(currentSlot, slotDuration);
      if (slotEnd <= endTime) {
        slots.push({
          date: format(selectedDate, 'yyyy-MM-dd'),
          start: format(currentSlot, 'HH:mm'),
          end: format(slotEnd, 'HH:mm'),
          status: 'available',
        });
      }
      currentSlot = slotEnd;
    }

    setFormData((prev) => ({
      ...prev,
      availableSlots: [...prev.availableSlots, ...slots],
    }));
  };

  const removeSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.filter((_, i) => i !== index),
    }));
  };

  // Save profile including picture and slots to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let profilePictureUrl = formData.profilePictureUrl;

      if (profilePicture) {
        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
        await uploadBytes(storageRef, profilePicture);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      await setDoc(
        doc(firestore, 'users', currentUser.uid),
        {
          ...formData,
          profilePictureUrl,
          role: 'doctor',
          profileCompleted: true,
        },
        { merge: true }
      );

      alert('Profile and available slots saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="text-lg text-gray-500">Loading...</div></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-700">Doctor Profile</h2>

        {/* Profile Picture */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-28 h-28 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50">
            {profilePicture ? (
              <img src={URL.createObjectURL(profilePicture)} alt="Profile" className="object-cover h-full w-full" />
            ) : formData.profilePictureUrl ? (
              <img src={formData.profilePictureUrl} alt="Profile" className="object-cover h-full w-full" />
            ) : (
              <div className="flex justify-center items-center h-full text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="profilePicture" className="text-sm font-semibold text-gray-500">Upload Profile Picture</label>
            <input id="profilePicture" type="file" onChange={handleFileChange} className="mt-2 p-1 border rounded border-gray-300" />
          </div>
        </div>

        {/* Form Fields */}
        {/* Rest of the form fields remain unchanged */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="Gender"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              placeholder="Date of Birth"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="degrees"
            value={formData.degrees}
            onChange={handleChange}
            placeholder="Degrees and Certifications"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Years of Experience"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="Specialization"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <input
            type="text"
            name="clinicName"
            value={formData.clinicName}
            onChange={handleChange}
            placeholder="Clinic Name"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="clinicAddress"
            value={formData.clinicAddress}
            onChange={handleChange}
            placeholder="Clinic Address"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Working Hours and Slot Generation */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Define Working Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Start Time</label>
            <input
              type="time"
              name="start"
              value={workingHours.start}
              onChange={handleWorkingHoursChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">End Time</label>
            <input
              type="time"
              name="end"
              value={workingHours.end}
              onChange={handleWorkingHoursChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Slot Duration (minutes)</label>
            <input
              type="number"
              value={slotDuration}
              onChange={(e) => setSlotDuration(parseInt(e.target.value))}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Generate Slots Button */}
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={generateSlots}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaCalendarAlt className="mr-2" /> Generate Slots
          </button>
        </div>

        {/* Display Available Slots */}
        {formData.availableSlots.length > 0 && (
          <div className="overflow-auto max-h-64 mb-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-700">Available Slots</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {formData.availableSlots.map((slot, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded-lg mb-2 shadow-sm"
                >
                  <span className="flex items-center">
                    {slot.date} - {slot.start} to {slot.end} 
                    {slot.status === 'available' ? (
                      <FaCheckCircle className="ml-2 text-green-500" title="Available" />
                    ) : (
                      <FaBan className="ml-2 text-red-500" title="Booked" />
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSlot(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Save Profile Button */}
        <button type="submit" className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg">
          Save Profile
        </button>
      </div>
    </form>
  );
}
