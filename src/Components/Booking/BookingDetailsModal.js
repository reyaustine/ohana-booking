import React, { useState, useEffect } from 'react';
import BookingUpdateModal from './BookingUpdateModal'; // Import the new component
import ExtensionModal from './ExtensionModal';
import './BookingDetailsModal.css';

const BookingDetailsModal = ({ isOpen, onClose, booking, refreshBookings }) => {
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setCurrentUserEmail(user.email);
    }
  }, []);

  if (!isOpen || !booking) return null;

  const { renterDetails, bookingDetails } = booking;

  const handleExtend = async (extensionHours, additionalFee) => {
    // Handle extension logic
  };

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
          <p><strong>Payment Method:</strong> {bookingDetails.payment}</p>
          <p><strong>Total Fee:</strong> {bookingDetails.totalFee}</p>
          <p><strong>Return Date:</strong> {new Date(bookingDetails.returnDate).toLocaleString()}</p>
          {bookingDetails.extensionHoursFee && (
            <p><strong>Extension Fee:</strong> {bookingDetails.extensionHoursFee}</p>
          )}
          <div>
            <strong>Notes:</strong>
            <pre style={{ width: '394px', height: '225px' }}>{bookingDetails.notes}</pre>
          </div>
        </div>
        <div className="modal-footer">
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Update</button>
          <button className="extend-btn" onClick={() => setIsExtensionModalOpen(true)}>Extend Hours</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
        {isEditing && (
          <BookingUpdateModal 
            isOpen={isEditing} // Pass the isOpen prop
            booking={booking}
            currentUserEmail={currentUserEmail}
            refreshBookings={refreshBookings}
            onClose={() => setIsEditing(false)}
          />
        )}
        {!isEditing && bookingDetails.updatedBy && bookingDetails.updatedDate && (
          <div className="modal-footer-info">
            <p><small>Last updated by: {bookingDetails.updatedBy}</small></p>
            <p><small>Last updated on: {new Date(bookingDetails.updatedDate).toLocaleString()}</small></p>
          </div>
        )}
      </div>
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        onExtend={handleExtend}
      />
    </div>
  );
};

export default BookingDetailsModal;
