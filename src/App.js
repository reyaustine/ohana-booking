import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './Contexts/AuthContext';
import Login from './Components/Login/Login';
import Dashboard from './Components/Dash/Dashboard';
import ProtectedRoute from './Contexts/ProtectedRoute';
import BookingCalendar from './Components/Booking/BookingCalendar';
import VehiclesPage from './Components/Vehicles/VehiclesPage';
import CustomerPage from './Components/Customer/CustomerPage';
import SettingsPage from './Components/Settings/SettingsPage';
import './App.css';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or any loading component
  }

  return (
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
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;