// src/Components/Navigation/Sidebar/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ sidebarCollapsed, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!sidebarCollapsed && <h1>CarRent Admin</h1>}
        <button onClick={toggleSidebar} className="toggle-btn">
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/" className="active">
              <i className="fas fa-tachometer-alt"></i>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="bookings">
              <i className="fas fa-calendar-alt"></i>
              {!sidebarCollapsed && <span>Bookings</span>}
            </Link>
          </li>
          <li>
            <Link to="vehicles">
              <i className="fas fa-car"></i>
              {!sidebarCollapsed && <span>Vehicles</span>}
            </Link>
          </li>
          <li>
            <Link to="customers">
              <i className="fas fa-users"></i>
              {!sidebarCollapsed && <span>Customers</span>}
            </Link>
          </li>
          <li>
            <Link to="#">
              <i className="fas fa-chart-bar"></i>
              {!sidebarCollapsed && <span>Reports</span>}
            </Link>
          </li>
          <li>
            <Link to="settings">
              <i className="fas fa-cog"></i>
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
