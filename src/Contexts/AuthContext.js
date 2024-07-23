import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
    // You might want to store some user info in localStorage here
    console.log('Authentication state updated: User is now logged in');
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Clear user info from localStorage here
    console.log('Authentication state updated: User is now logged out');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);