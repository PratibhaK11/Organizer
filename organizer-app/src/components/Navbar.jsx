import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { unsubscribeUser } from '../utils/subscribe';

const Navbar = ({ tasks, setTasks }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await unsubscribeUser(); // Unsubscribe user before logging out
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="sticky top-0 left-0 right-0 bg-orangered text-white p-4 flex justify-between items-center shadow-lg z-50">
      <div className="text-2xl font-semibold">
        <a href="/" className="hover:text-gray-400">Organizer</a>
      </div>

      {user && (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            className="flex items-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full transition duration-300"
          >
            {user.name}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-black text-white border border-gray-300 rounded-lg shadow-lg transition-opacity duration-300">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-700"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
