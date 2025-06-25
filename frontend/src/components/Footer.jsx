import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-sm mt-8">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-600 sm:text-center">
          © {new Date().getFullYear()}{' '}
          <Link 
            to="/" 
            className="font-semibold bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] bg-clip-text text-transparent hover:underline"
          >
            YourBrand™
          </Link>. All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-600 sm:mt-0">
          <li>
            <Link 
              to="/about" 
              className="hover:bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] hover:bg-clip-text hover:text-transparent me-4 md:me-6 transition-all duration-300"
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/privacy" 
              className="hover:bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] hover:bg-clip-text hover:text-transparent me-4 md:me-6 transition-all duration-300"
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link 
              to="/licensing" 
              className="hover:bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] hover:bg-clip-text hover:text-transparent me-4 md:me-6 transition-all duration-300"
            >
              Licensing
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" 
              className="hover:bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] hover:bg-clip-text hover:text-transparent transition-all duration-300"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;