import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userType } = useAuth();
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If no specific role is required, allow access
  if (!requiredRole) {
    return children;
  }

  // Convert to lowercase for case-insensitive comparison
  const userRole = userType?.toLowerCase();
  const requiredRoleLower = requiredRole.toLowerCase();

  // Check if user has the required role
  if (requiredRoleLower === 'admin' && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRoleLower === 'user' && !['user', 'tl'].includes(userRole)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute; 