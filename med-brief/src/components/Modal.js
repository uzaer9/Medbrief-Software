// src/components/Modal.js
import React, { useState } from 'react';
import { format } from 'date-fns';

const Modal = ({ isOpen, doctor, selectedDate, nextSevenDays, setSelectedDate, handleBookSlot, closeModal }) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null); // Track selected slot

  if (!isOpen || !doctor) return null;

  const handleSlotSelection = (index) => {
    setSelectedSlotIndex(index); // Set selected slot when radio button is clicked
  };

  const slotStatusStyles = (slot) => {
    return slot.status === 'available'
      ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100'
      : 'border-red-500 text-red-600 bg-red-50 hover:bg-red-100';
  };

  const slotStatusIcon = (slot) => {
    return slot.status === 'available' ? (
      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
      </svg>
    ) : (
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  return (
    <div id="select-modal" className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
          <button onClick={closeModal} className="text-gray-400 hover:bg-gray-200 rounded-lg text-sm h-8 w-8">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-lg font-semibold">Select a date:</h4>
          <div className="grid grid-cols-7 gap-2 my-4">
            {nextSevenDays.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded-md text-center ${selectedDate === date ? 'bg-blue-200' : 'bg-gray-100'}`}
              >
                <div className="text-sm">{format(date, 'EEE')}</div>
                <div className="text-lg font-bold">{format(date, 'd')}</div>
              </button>
            ))}
          </div>

          <h4 className="text-lg font-semibold">Available Slots:</h4>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {doctor.availableSlots
              ?.filter(slot => slot.date === format(selectedDate, 'yyyy-MM-dd'))
              .map((slot, index) => (
                <li key={index} className={`flex items-center justify-between p-4 border rounded-md shadow-md cursor-pointer ${slotStatusStyles(slot)}`} onClick={() => handleSlotSelection(index)}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="slot"
                      value={index}
                      onChange={() => handleSlotSelection(index)}
                      checked={selectedSlotIndex === index}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-lg font-medium">
                      {slot.start} - {slot.end}
                    </span>
                  </div>
                  <div className="tooltip flex items-center space-x-2">
                    {slotStatusIcon(slot)}
                    <span className="tooltip-text bg-gray-700 text-white rounded-lg px-2 py-1 text-xs">
                      {slot.status === 'available' ? 'Available' : 'Booked'}
                    </span>
                  </div>
                </li>
              ))}
          </ul>

          <button
            disabled={selectedSlotIndex === null}
            onClick={() => handleBookSlot(doctor.id, selectedSlotIndex)}
            className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Book Slot
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
