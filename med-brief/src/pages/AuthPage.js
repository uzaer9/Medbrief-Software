// src/pages/AuthPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthPage() {
  const { signUp, login, errorMsg, setErrorMsg } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const nameRef = useRef(null);
  const specializationRef = useRef(null);
  const experienceRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'signup') {
      setIsSigningIn(false);
    } else {
      setIsSigningIn(true);
    }
  }, [location.search]);

  const handleRoleChange = (e) => {
    setIsDoctor(e.target.value === 'doctor');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const name = nameRef.current?.value;
    const specialization = isDoctor ? specializationRef.current?.value : null;
    const experience = isDoctor ? experienceRef.current?.value : null;

    setErrorMsg(null);

    try {
      if (isSigningIn) {
        await login(email, password);
        navigate('/');
      } else {
        await signUp(email, password, name, isDoctor ? 'doctor' : 'patient', specialization, experience);
        setIsSigningIn(true);
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          {isSigningIn ? 'Sign In' : 'Sign Up'}
        </h1>
        {errorMsg && <p className="text-red-500 text-center mb-4">{errorMsg}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSigningIn && (
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
            {isSigningIn ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p
          className="mt-4 text-center text-blue-500 hover:underline cursor-pointer"
          onClick={() => {
            setIsSigningIn(!isSigningIn);
            setErrorMsg(null);
          }}
        >
          {isSigningIn ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
