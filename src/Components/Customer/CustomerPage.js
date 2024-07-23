// src/Components/Customer/CustomerPage.js

import React, { useState, useEffect } from 'react';
import './CustomerPage.css';

const CustomerPage = () => {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Fetch customer data from an API or static data
    const customerData = {
      id: 1,
      name: 'John Doe',
      vehicle: 'Toyota Camry',
      hours: 4,
      pickupLocation: 'Downtown',
      idType: 'Drivers License',
      idNumber: 'D1234567'
    };

    const customerTableData = [
      {
        name: 'John Doe',
        vehicle: 'Toyota Camry',
        mobile: '123-456-7890',
        city: 'New York',
        rentTimes: 2,
        rentDate: '2024-07-20',
        rentHours: 4
      },
      {
        name: 'Jane Smith',
        vehicle: 'Honda Civic',
        mobile: '987-654-3210',
        city: 'Los Angeles',
        rentTimes: 1,
        rentDate: '2024-07-18',
        rentHours: 3
      },
      // Add more customers as needed
    ];

    setCurrentCustomer(customerData);
    setCustomers(customerTableData);
  }, []);

  return (
    <div className="customer-page">
      {currentCustomer && (
        <div className="current-customer-card">
          <h2>Current Customer</h2>
          <p><strong>Renter Name:</strong> {currentCustomer.name}</p>
          <p><strong>Vehicle Rented:</strong> {currentCustomer.vehicle}</p>
          <p><strong>Hours:</strong> {currentCustomer.hours}</p>
          <p><strong>Pickup Location:</strong> {currentCustomer.pickupLocation}</p>
          <p><strong>ID:</strong> {currentCustomer.idType} - {currentCustomer.idNumber}</p>
        </div>
      )}

      <div className="customer-table">
        <h2>All Customers</h2>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Rented Vehicle</th>
              <th>Mobile Number</th>
              <th>City Address</th>
              <th>Rent Times</th>
              <th>Rent Date</th>
              <th>Rent Hours</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index}>
                <td>{customer.name}</td>
                <td>{customer.vehicle}</td>
                <td>{customer.mobile}</td>
                <td>{customer.city}</td>
                <td>{customer.rentTimes}</td>
                <td>{customer.rentDate}</td>
                <td>{customer.rentHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="fab" onClick={() => alert('Add Customer functionality here')}>
        <i className="fas fa-plus"></i>
        <span>Add Customer</span>
      </button>
    </div>
  );
};

export default CustomerPage;
