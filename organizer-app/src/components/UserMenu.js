// src/components/UserMenu.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const UserMenu = () => {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {user.name}
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-black hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
