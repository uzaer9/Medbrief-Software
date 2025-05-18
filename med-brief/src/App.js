import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfilePage from './pages/DoctorProfilePage';
import PatientProfilePage from './pages/PatientProfilePage';
import DoctorAppointments from './pages/DoctorAppointments';
// import PatientAppointments from './pages/PatientAppointments';
import DoctorList from './components/DoctorList';
import PatientPage from './pages/PatientPage';
import Navbar from './components/Navbar';

function App() {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();  // Get the current route

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {/* Conditionally render Navbar if the current route is not HomePage ("/") */}
      {location.pathname !== '/' && <Navbar />}

      <Routes>
        {!currentUser ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* Redirect all undefined routes to the home page */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : role === 'doctor' ? (
          <>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor-profile" element={<DoctorProfilePage />} />
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            {/* Redirect all undefined routes to the doctor's dashboard */}
            <Route path="*" element={<Navigate to="/doctor-dashboard" />} />
          </>
        ) : role === 'patient' ? (
          <>
            <Route path="/patient-profile" element={<PatientProfilePage />} />
            <Route path="/patient-dashboard" element={<PatientPage />} />
            <Route path="/doctors" element={<DoctorList />} />
            {/* <Route path="/patient-appointments" element={<PatientAppointments />} /> */}
            {/* Redirect all undefined routes to the patient's dashboard */}
            <Route path="*" element={<Navigate to="/patient-dashboard" />} />
          </>
        ) : (
          // Redirect in case there's no matching role
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </>
  );
}

export default App;
