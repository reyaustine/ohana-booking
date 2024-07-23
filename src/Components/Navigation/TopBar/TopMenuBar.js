import React from 'react';
import './TopMenuBar.css';

const TopMenuBar = ({ sidebarCollapsed }) => {
  return (
    <div className={`top-menu-bar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="search-container">
        <input type="text" placeholder="Search" />
      </div>
      <div className="menu-items">
        <div className="notification">
          <i className="fas fa-bell"></i><span className="badge">6</span>
        </div>
        <button className="book-car-button">+ Book a Car</button>
      </div>
    </div>
  );
};

export default TopMenuBar;
