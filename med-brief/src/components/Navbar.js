import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disclosure, Menu , Transition} from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Disclosure as="nav" className="bg-blue-600">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <Link to="/" className="text-white font-bold text-lg">
                  MedBreif
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:block sm:ml-6">
                <div className="flex space-x-4">
                  <Link to="/" className="text-white hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </Link>
                  {role === 'doctor' && (
                    <>
                      <Link to="/doctor-dashboard" className="text-white hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Dashboard
                      </Link>
                      <Link to="/doctor-appointments" className="text-white hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Appointments
                      </Link>
                      <Link to="/doctor-profile" className="text-white hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Profile
                      </Link>
                    </>
                  )}

                  {role === 'patient' && (
                    <>
                      <Link to="/patient-dashboard" className="text-white hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Dashboard
                      </Link>
                      <Link to="/doctors" className="text-white hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Doctors
                      </Link>
                      <Link to="/patient-profile" className="text-white hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        Profile
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Profile Menu / Logout Button */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {currentUser ? (
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button className="flex rounded-full bg-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600">
                        <span className="sr-only">Open user menu</span>
                        <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/49" alt="" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={React.Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-4 items-center">
                    <Link
                      to="/auth?mode=login"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500">
                Home
              </Link>
              {role === 'doctor' && (
                <>
                  <Link to="/doctor-dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500">
                    Dashboard
                  </Link>
                  <Link to="/doctor-appointments" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500">
                    Appointments
                  </Link>
                  <Link to="/doctor-profile" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500">
                    Profile
                  </Link>
                </>
              )}

              {role === 'patient' && (
                <>
                  <Link to="/patient-dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500">
                    Dashboard
                  </Link>
                  <Link to="/doctors" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500">
                    Doctors
                  </Link>
                  <Link to="/patient-profile" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500">
                    Profile
                  </Link>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Navbar;
