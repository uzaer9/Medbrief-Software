import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const { signUp, login, errorMsg } = useAuth();
  const navigate = useNavigate();

  const [isDoctor, setIsDoctor] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const nameRef = useRef(null);
  const specializationRef = useRef(null);
  const experienceRef = useRef(null);

  const handleRoleChange = (e) => {
    setIsDoctor(e.target.value === 'doctor');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const name = nameRef.current.value;
    const specialization = isDoctor ? specializationRef.current?.value : null;
    const experience = isDoctor ? experienceRef.current?.value : null;

    if (isSignedIn) {
      await login(email, password);
    } else {
      const role = isDoctor ? 'doctor' : 'patient';
      await signUp(email, password, name, role, specialization, experience);
    }
  };

  const redirectBasedOnRole = (role) => {
    if (role === 'doctor') {
      navigate('/doctor-dashboard');
    } else {
      navigate('/patient-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          {isSignedIn ? 'Sign In' : 'Sign Up'}
        </h1>
        {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignedIn && (
            <>
              <input
                ref={nameRef}
                type="text"
                placeholder="Full Name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    onChange={handleRoleChange}
                    defaultChecked
                    className="mr-2"
                  />
                  Patient
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    onChange={handleRoleChange}
                    className="mr-2"
                  />
                  Doctor
                </label>
              </div>
              {isDoctor && (
                <>
                  <input
                    ref={specializationRef}
                    type="text"
                    placeholder="Specialization"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <input
                    ref={experienceRef}
                    type="number"
                    placeholder="Experience (years)"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </>
              )}
            </>
          )}
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            ref={passwordRef}
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full transition duration-300"
          >
            {isSignedIn ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p
          className="mt-4 text-center text-blue-500 hover:underline cursor-pointer"
          onClick={() => setIsSignedIn(!isSignedIn)}
        >
          {isSignedIn ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </p>
      </div>
    </div>
  );
}

export default SignUp;
