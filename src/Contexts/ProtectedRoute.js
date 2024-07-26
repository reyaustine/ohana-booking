import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  console.log('ProtectedRoute: Is user authenticated?', isAuthenticated);
  
  if (loading) {
    return <div>Loading...</div>; // Or any loading component
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;