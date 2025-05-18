// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/auth?mode=login');
  };

  const handleSignUpClick = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafb] overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-solid border-b-[#e8eef3] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0e151b]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">MedBreif</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <p className="text-sm font-medium" >For Patients</p>
              <p className="text-sm font-medium" >For Doctors</p>
              <p className="text-sm font-medium" >Pricing</p>
              <p className="text-sm font-medium" >Resources</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLoginClick}
                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-[#2c90e2] text-white text-sm font-bold"
              >
                Log in
              </button>
              <button
                onClick={handleSignUpClick}
                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-[#e8eef3] text-[#0e151b] text-sm font-bold"
              >
                Sign up
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="min-h-[480px] flex flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-4 pb-10 rounded-xl"
              style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url('https://cdn.usegalileo.ai/sdxl10/c65d1e87-506f-4a55-a4de-22038ebbd358.png')" }}>
              <div className="flex flex-col gap-2 text-left">
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Healthcare, connected</h1>
                <h2 className="text-white text-sm">Connect with your doctor, manage appointments in real-time, and get personalized healthcare solutions.</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleLoginClick}
                  className="flex min-w-[84px] items-center justify-center rounded-xl h-10 px-4 bg-[#2c90e2] text-white text-sm font-bold"
                >
                  Log in
                </button>
                <button
                  onClick={handleSignUpClick}
                  className="flex min-w-[84px] items-center justify-center rounded-xl h-10 px-4 bg-[#e8eef3] text-[#0e151b] text-sm font-bold"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* For Patients Section */}
        <div className="flex flex-col gap-10 px-4 py-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-[#0e151b] text-[32px] font-bold leading-tight">For patients</h1>
            <p className="text-[#0e151b] text-base">Get the care you need, when you need it. Chat with a doctor, book an appointment, get your questions answered, and more.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-3 pb-3">
              <div className="bg-cover rounded-xl aspect-video" style={{ backgroundImage: "url('https://cdn.usegalileo.ai/stability/32e31f8d-76f8-4f7e-b4e4-bdbcbc89f6c8.png')" }}></div>
              <p className="text-[#0e151b] text-base font-medium">Real-time doctor chat</p>
            </div>
            <div className="flex flex-col gap-3 pb-3">
              <div className="bg-cover rounded-xl aspect-video" style={{ backgroundImage: "url('https://cdn.usegalileo.ai/sdxl10/cae271b5-2726-4fd3-bab9-65d757c5a334.png')" }}></div>
              <p className="text-[#0e151b] text-base font-medium">Book an appointment</p>
            </div>
          </div>
        </div>

        {/* For Doctors Section */}
        <div className="flex flex-col gap-10 px-4 py-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-[#0e151b] text-[32px] font-bold leading-tight">For doctors</h1>
            <p className="text-[#0e151b] text-base">Make it easy for patients to reach you. Get paid for your time, provide high-quality care, and offer transcription services.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-3 pb-3">
              <div className="bg-cover rounded-xl aspect-video" style={{ backgroundImage: "url('https://cdn.usegalileo.ai/stability/fa1239b4-dcd3-4684-9ecb-14e5ad42df85.png')" }}></div>
              <p className="text-[#0e151b] text-base font-medium">Chat with patients</p>
            </div>
            <div className="flex flex-col gap-3 pb-3">
              <div className="bg-cover rounded-xl aspect-video" style={{ backgroundImage: "url('https://cdn.usegalileo.ai/stability/f1deff9b-eaa6-4f3f-b83a-a5d81ce492c8.png')" }}></div>
              <p className="text-[#0e151b] text-base font-medium">Offer transcription services</p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex flex-col justify-end gap-6 px-4 py-10">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-[#0e151b] text-[32px] font-bold">Ready to get started?</h1>
          </div>
          <div className="flex justify-center">
            <div className="flex gap-3">
              <button
                onClick={handleLoginClick}
                className="flex min-w-[84px] items-center justify-center rounded-xl h-10 px-4 bg-[#2c90e2] text-white text-sm font-bold"
              >
                Log in
              </button>
              <button
                onClick={handleSignUpClick}
                className="flex min-w-[84px] items-center justify-center rounded-xl h-10 px-4 bg-[#e8eef3] text-[#0e151b] text-sm font-bold"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
