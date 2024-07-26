import React from 'react';
import './BookingDetailsModal.css';

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const { renterDetails, bookingDetails } = booking;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Booking Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          <p><strong>Renter Name:</strong> {renterDetails.name}</p>
          <p><strong>Vehicle:</strong> {bookingDetails.vehicle}</p>
          <p><strong>Rent Date:</strong> {new Date(bookingDetails.rentDate).toLocaleString()}</p>
          <p><strong>Rent Duration:</strong> {bookingDetails.rentDuration} hours</p>
          <p><strong>Payment:</strong> {bookingDetails.totalFee}</p>
          <p><strong>Mode of Payment:</strong> {bookingDetails.payment}</p>
          <p><strong>Return Date:</strong> {new Date(bookingDetails.returnDate).toLocaleString()}</p>
          <div>
            <strong>Notes:</strong>
            <pre>{bookingDetails.notes}</pre>
          </div>
        </div>
        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;