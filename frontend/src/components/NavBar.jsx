// Update NavBar.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const Navbar = () => {
  const { currentUser, logout_user } = useContext(UserContext);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">SO Clone</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </Link>
              {/* Other nav links */}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <UserDropdown user={currentUser} logout={logout_user} />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Add these components in the same file
const UserDropdown = ({ user, logout }) => (
  <div className="ml-3 relative">
    <div>
      <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <span className="sr-only">Open user menu</span>
        <img className="h-8 w-8 rounded-full" src={user.avatar || '/default-avatar.png'} alt="" />
      </button>
    </div>
    {/* Dropdown content */}
  </div>
);

const AuthButtons = () => (
  <div className="flex space-x-4">
    <Link to="/login" className="text-gray-900 text-sm font-medium">
      Sign in
    </Link>
    <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
      Sign up
    </Link>
  </div>
);

export default Navbar;