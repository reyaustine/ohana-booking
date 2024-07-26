import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';
import { UserProvider } from './Contexts/UserContext';
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
      <UserProvider>
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
                </Route>
              </Route>
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;