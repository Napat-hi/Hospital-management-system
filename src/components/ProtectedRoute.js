import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get authentication info from localStorage
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const userRole = localStorage.getItem('role');

  // If not logged in, redirect to login page (Home)
  if (!loggedIn) {
    return <Navigate to="/" replace />;
  }

  // If logged in but role is not allowed, redirect to login page
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // If logged in and role is allowed, render the protected page
  return children;
};

export default ProtectedRoute;
