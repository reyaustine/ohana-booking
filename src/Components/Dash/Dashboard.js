// src/Components/Dash/Dashboard.js

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../Navigation/Sidebar/Sidebar';
import BookingModal from '../Booking/BookingModal';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const openBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  return (
    <div className="dashboard">
      <Sidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <header className="top-bar">
          <h2>Dashboard</h2>
          <div className="user-menu">
            <img src="user-avatar.jpg" alt="User Avatar" className="avatar" />
            <span>Admin User</span>
          </div>
        </header>

        <section className="dashboard-content">
          {location.pathname === '/' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Today's Bookings</h3>
                  <p className="stat-value">24</p>
                </div>
                <div className="stat-card">
                  <h3>Available Cars</h3>
                  <p className="stat-value">18</p>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">$3,450</p>
                </div>
              </div>

              <div className="recent-bookings">
                <h3>Recent Bookings</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#12345</td>
                      <td>John Doe</td>
                      <td>Toyota Camry</td>
                      <td>2024-07-22</td>
                      <td><span className="status confirmed">Confirmed</span></td>
                    </tr>
                    <tr>
                      <td>#12346</td>
                      <td>Jane Smith</td>
                      <td>Honda Civic</td>
                      <td>2024-07-23</td>
                      <td><span className="status pending">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
          <Outlet />
        </section>
      </main>

      <button className="fab" onClick={openBookingModal}>
        <i className="fas fa-plus"></i>
        <span>Book</span>
      </button>

      <BookingModal isOpen={isBookingModalOpen} onClose={closeBookingModal} />
    </div>
  );
};

export default Dashboard;