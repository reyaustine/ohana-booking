// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';
import Login from './Components/Login/Login';
import Dashboard from './Components/Dash/Dashboard';
import ProtectedRoute from './Contexts/ProtectedRoute';
import BookingCalendar from './Components/Booking/BookingCalendar';
import VehiclesPage from './Components/Vehicles/VehiclesPage';
import CustomerPage from './Components/Customer/CustomerPage';
import SettingsPage from './Components/Settings/SettingsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />}>
                <Route path="bookings" element={<BookingCalendar />} />
                <Route path="vehicles" element={<VehiclesPage />} />
                <Route path="customers" element={<CustomerPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Add other protected routes here */}
              </Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;