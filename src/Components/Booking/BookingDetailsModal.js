import React, { useState, useEffect } from 'react';
import BookingUpdateModal from './BookingUpdateModal';
import ExtensionModal from './ExtensionModal';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './BookingDetailsModal.css';

const BookingDetailsModal = ({ isOpen, onClose, booking, refreshBookings }) => {
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setCurrentUserEmail(user.email);
    }
  }, []);

  if (!isOpen || !booking) return null;

  const { renterDetails, bookingDetails } = booking;

  const handleExtend = async (extensionHours, additionalFee) => {
    console.log('Extending booking:', extensionHours, additionalFee);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    const newCaptcha = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptcha(newCaptcha);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (userCaptcha === captcha) {
      const bookingRef = doc(db, 'bookings', booking.bookingID);
      await updateDoc(bookingRef, {
        active: 'NO',
        updatedBy: currentUserEmail,
        updatedDate: new Date().toISOString()
      });

      setShowDeleteConfirmation(false);
      onClose();
      refreshBookings();
    } else {
      alert('Incorrect captcha. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
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
            <pre className="notes-pre">{bookingDetails.notes}</pre>
          </div>
        </div>
        <div className="modal-footer">
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Update</button>
          <button className="extend-btn" onClick={() => setIsExtensionModalOpen(true)}>Extend Hours</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
        <div className="delete-section">
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        </div>
        {!isEditing && bookingDetails.updatedBy && bookingDetails.updatedDate && (
          <div className="modal-footer-info">
            <p><small>Last updated by: {bookingDetails.updatedBy}</small></p>
            <p><small>Last updated on: {new Date(bookingDetails.updatedDate).toLocaleString()}</small></p>
          </div>
        )}
      </div>
      {isEditing && (
        <BookingUpdateModal 
          isOpen={isEditing}
          booking={booking}
          currentUserEmail={currentUserEmail}
          refreshBookings={refreshBookings}
          onClose={() => setIsEditing(false)}
        />
      )}
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        onExtend={handleExtend}
      />
      {showDeleteConfirmation && (
        <div className="delete-confirmation-modal">
          <h3>Confirm Deletion</h3>
          <p>Please enter the following code to confirm deletion: {captcha}</p>
          <input
            type="text"
            value={userCaptcha}
            onChange={(e) => setUserCaptcha(e.target.value)}
            placeholder="Enter captcha"
          />
          <div className="modal-footer">
            <button onClick={confirmDelete}>Confirm Delete</button>
            <button onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsModal;