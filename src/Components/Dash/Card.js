// src/Components/Dash/Card.js
import React from 'react';
import './Card.css';

const Card = ({ title, value, icon, trend, trendText }) => {
  return (
    <div className="card">
      <div className="card-content">
        <div className="card-icon">
          <i className={`fas ${icon}`}></i>
        </div>
        <div className="card-info">
          <h3>{title}</h3>
          <p className="card-value">{value}</p>
          <p className={`card-trend ${trend}`}>{trendText}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
