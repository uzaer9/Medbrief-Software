import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../firebase/firebase'; // Firebase storage added
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // For image upload
import { useAuth } from '../context/AuthContext';

function PatientProfileForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    allergies: '',
    chronicConditions: '',
    pastSurgeries: '',
    currentMedications: '',
    familyHistory: '',
    profilePhotoUrl: '',
  });
  const [age, setAge] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  // Fetch existing data from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(firestore, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData(data);
        calculateAge(data.dob);
      }
    };
    fetchData();
  }, [currentUser]);

  const calculateAge = (dob) => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const ageNow = new Date().getFullYear() - birthDate.getFullYear();
    setAge(ageNow);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'dob') {
      calculateAge(value); // Update age when DOB changes
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let photoUrl = formData.profilePhotoUrl;

    // Upload profile photo to Firebase Storage if a new photo is selected
    if (photoFile) {
      const photoRef = ref(storage, `profilePhotos/${currentUser.uid}`);
      await uploadBytes(photoRef, photoFile);
      photoUrl = await getDownloadURL(photoRef);
    }

    try {
      // Save form data to Firestore, including the photo URL
      await setDoc(
        doc(firestore, 'users', currentUser.uid),
        {
          ...formData,
          profilePhotoUrl: photoUrl,
          role: 'patient',
          profileCompleted: true,
        },
        { merge: true }
      );

      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Complete Your Profile
        </h2>

        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          placeholder="Date of Birth"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <div className="w-full p-3 border border-gray-300 rounded-md focus:outline-none">
          <label className="block text-gray-700">Age: {age || 'N/A'}</label>
        </div>

        <input
          type="text"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          placeholder="Gender"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="text"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
          placeholder="Blood Group"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* Profile Photo Upload */}
        <div className="w-full p-3 border border-gray-300 rounded-md focus:outline-none">
          <label className="block text-gray-700">Profile Photo:</label>
          <input type="file" onChange={handlePhotoChange} accept="image/*" />
          {formData.profilePhotoUrl && (
            <img
              src={formData.profilePhotoUrl}
              alt="Profile"
              className="mt-4 h-20 w-20 object-cover rounded-full"
            />
          )}
        </div>

        <textarea
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          placeholder="Known Allergies"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          name="chronicConditions"
          value={formData.chronicConditions}
          onChange={handleChange}
          placeholder="Chronic Conditions"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          name="pastSurgeries"
          value={formData.pastSurgeries}
          onChange={handleChange}
          placeholder="Past Surgeries"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          name="currentMedications"
          value={formData.currentMedications}
          onChange={handleChange}
          placeholder="Current Medications"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          name="familyHistory"
          value={formData.familyHistory}
          onChange={handleChange}
          placeholder="Family Medical History"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full transition duration-300"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default PatientProfileForm;
