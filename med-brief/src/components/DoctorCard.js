import React from 'react';
import { FaStethoscope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { FaGraduationCap } from 'react-icons/fa';

const DoctorCard = ({ doctor, onBookAppointment }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6 max-w-md w-full">
      {/* Profile Picture and Basic Info */}
      <div className="flex items-center mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
          <img src={doctor.profilePictureUrl || '/default-avatar.png'} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-bold text-gray-800">{doctor.fullName}</h3>
          <p className="text-gray-600">
            <FaStethoscope className="inline-block text-blue-500 mr-1" /> {doctor.specialization}
          </p>
          {/* Removed experience line */}
        </div>
      </div>

      {/* Clinic Information */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-700">Clinic Info</h4>
        <p className="text-gray-600">
          <FaMapMarkerAlt className="inline-block text-red-500 mr-1" /> {doctor.clinicName}, {doctor.clinicAddress}
        </p>
      </div>

      {/* Contact Information */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-700">Qualifications</h4>
        <p className="text-gray-600">
        <FaGraduationCap className="inline-block text-green-500 mr-1" /> {doctor.degrees} 
        </p>
      </div>

      {/* Book Appointment Button */}
      <button
        onClick={onBookAppointment}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-center font-semibold"
      >
        Book Appointment
      </button>
    </div>
  );
};

export default DoctorCard;
