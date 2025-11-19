import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = "", style = {} }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    
    // Optionally clear all localStorage
    // localStorage.clear();

    // Redirect to login page (Home)
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "btn btn-danger"}
      style={style}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
