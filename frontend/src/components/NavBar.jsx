import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function NavBar() {
  const { user, logout_user } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <span className="self-center text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] bg-clip-text text-transparent">
            YourLogo
          </span>
        </button>
        
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {user ? (
            <div className="relative">
              <button
                type="button"
                className="flex text-sm bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] rounded-full focus:ring-4 focus:ring-[#FF4B2B]/50"
                onClick={() => navigate('/profile')}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </button>
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
          
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
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
                onClick={() => navigate('/about')}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#FF416C] md:p-0"
              >
                About
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/services')}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#FF416C] md:p-0"
              >
                Services
              </button>
            </li>
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
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;