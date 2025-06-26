import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function NavBar() {
  const { currentUser, logout_user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    await logout_user();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <span className="self-center text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] bg-clip-text text-transparent">
            Audio Alchemy
          </span>
        </button>
        
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                className="flex text-sm bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] rounded-full focus:ring-4 focus:ring-[#FF4B2B]/50"
                onClick={handleProfileClick}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
              </button>
              
              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-3 border-b">
                    <div className="font-medium text-gray-900">Hi, {currentUser.username}</div>
                    <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:text-white relative overflow-hidden group"
                    >
                      <span className="relative z-10">Profile Settings</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:text-white relative overflow-hidden group"
                    >
                      <span className="relative z-10">Sign out</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/auth', { state: { formType: 'login' } })}
                className="px-4 py-2 text-sm font-medium text-[#FF416C] hover:text-[#FF4B2B]"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth', { state: { formType: 'signup' } })}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] rounded-lg hover:from-[#FF416C] hover:to-[#FF4B2B] transition-all"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
        
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
            <li>
              <button
                onClick={() => navigate('/')}
                className="block py-2 px-3 text-white rounded md:bg-transparent md:text-[#FF416C] md:p-0 hover:text-[#FF4B2B]"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/speakers')}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#FF416C] md:p-0"
              >
                Speakers
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/request')}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#FF416C] md:p-0"
              >
                Requests
              </button>
            </li>
            {/*
            <li>
              <button
                onClick={() => navigate('/pricing')}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#FF416C] md:p-0"
              >
                Pricing
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/contact')}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#FF416C] md:p-0"
              >
                Contact
              </button>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;