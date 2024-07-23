import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  console.log('ProtectedRoute: Is user authenticated?', isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;