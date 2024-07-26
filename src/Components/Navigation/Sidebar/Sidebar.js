import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src="/7.png" alt="Logo" className="logo" />
        <h1>Ohana CarRental</h1>
        <button onClick={toggleSidebar} className="toggle-btn">
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/bookings" className={location.pathname === '/bookings' ? 'active' : ''}>
              <i className="fas fa-calendar-alt"></i>
              <span>Bookings</span>
            </Link>
          </li>
          <li>
            <Link to="/vehicles" className={location.pathname === '/vehicles' ? 'active' : ''}>
              <i className="fas fa-car"></i>
              <span>Vehicles</span>
            </Link>
          </li>
          <li>
            <Link to="/customers" className={location.pathname === '/customers' ? 'active' : ''}>
              <i className="fas fa-users"></i>
              <span>Customers</span>
            </Link>
          </li>
          <li>
            <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
              <i className="fas fa-chart-bar"></i>
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;