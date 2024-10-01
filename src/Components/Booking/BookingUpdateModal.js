import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '../../firebase';
import './BookingUpdateModal.css';

const BookingUpdateModal = ({ isOpen, onClose, booking, refreshBookings }) => {
  const [updatedBookingDetails, setUpdatedBookingDetails] = useState({ ...booking?.bookingDetails });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    if (booking) {
      setUpdatedBookingDetails({ ...booking.bookingDetails });
    }
  }, [booking]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vehicles'));
        const vehicleData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const filteredVehicles = vehicleData.filter(vehicle => vehicle.name !== 'Select a vehicle');
        setVehicles(filteredVehicles);
      } catch (error) {
        console.error('Error fetching vehicles: ', error);
      }
    };

    fetchVehicles();
  }, []);

  if (!isOpen || !booking) return null;

  const calculateReturnDate = (rentDate, rentDuration) => {
    const rentDateTime = new Date(rentDate);
    return new Date(rentDateTime.getTime() + rentDuration * 60 * 60 * 1000);
  };

  const calculateRentDuration = (rentDate, returnDate) => {
    const rentDateTime = new Date(rentDate);
    const returnDateTime = new Date(returnDate);
    return (returnDateTime - rentDateTime) / (60 * 60 * 1000);
  };

  const handleRentDateChange = (date) => {
    const newReturnDate = calculateReturnDate(date, updatedBookingDetails.rentDuration);
    setUpdatedBookingDetails({
      ...updatedBookingDetails,
      rentDate: date.toISOString(),
      returnDate: newReturnDate.toISOString(),
    });
  };

  const handleRentDurationChange = (e) => {
    const newDuration = parseFloat(e.target.value);
    const newReturnDate = calculateReturnDate(new Date(updatedBookingDetails.rentDate), newDuration);
    setUpdatedBookingDetails({
      ...updatedBookingDetails,
      rentDuration: newDuration,
      returnDate: newReturnDate.toISOString(),
    });
  };

  const handleReturnDateChange = (date) => {
    const newRentDuration = calculateRentDuration(new Date(updatedBookingDetails.rentDate), date);
    setUpdatedBookingDetails({
      ...updatedBookingDetails,
      returnDate: date.toISOString(),
      rentDuration: newRentDuration,
    });
  };

  const handleUpdate = async () => {
    const bookingRef = doc(db, 'bookings', booking.bookingID);
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const updatedBy = currentUser ? currentUser.email : 'Unknown';

    await updateDoc(bookingRef, {
      'bookingDetails.vehicle': updatedBookingDetails.vehicle,
      'bookingDetails.rentDate': updatedBookingDetails.rentDate,
      'bookingDetails.rentDuration': updatedBookingDetails.rentDuration,
      'bookingDetails.payment': updatedBookingDetails.payment,
      'bookingDetails.notes': updatedBookingDetails.notes,
      'bookingDetails.totalFee': updatedBookingDetails.totalFee,
      'bookingDetails.returnDate': updatedBookingDetails.returnDate,
      'updatedBy': updatedBy,
      'updatedDate': new Date().toISOString(),
    });

    onClose();
    refreshBookings();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Update Booking</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          <label>
            <strong>Vehicle:</strong>
            <select
              name="vehicle"
              value={updatedBookingDetails.vehicle}
              onChange={(e) => setUpdatedBookingDetails({ ...updatedBookingDetails, vehicle: e.target.value })}
            >
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.name}>{vehicle.name}</option>
              ))}
            </select>
          </label>
          <label>
            <strong>Rent Date:</strong>
            <DatePicker
              selected={new Date(updatedBookingDetails.rentDate)}
              onChange={handleRentDateChange}
              showTimeSelect
              dateFormat="Pp"
            />
          </label>
          <label>
            <strong>Rent Duration (hours):</strong>
            <input
              type="number"
              name="rentDuration"
              value={updatedBookingDetails.rentDuration}
              onChange={handleRentDurationChange}
              step="0.1"
            />
          </label>
          <label>
            <strong>Return Date:</strong>
            <DatePicker
              selected={new Date(updatedBookingDetails.returnDate)}
              onChange={handleReturnDateChange}
              showTimeSelect
              dateFormat="Pp"
            />
          </label>
          <label>
            <strong>Payment Method:</strong>
            <input
              type="text"
              name="payment"
              value={updatedBookingDetails.payment}
              onChange={(e) => setUpdatedBookingDetails({ ...updatedBookingDetails, payment: e.target.value })}
            />
          </label>
          <label>
            <strong>Total Fee:</strong>
            <input
              type="number"
              name="totalFee"
              value={updatedBookingDetails.totalFee}
              onChange={(e) => setUpdatedBookingDetails({ ...updatedBookingDetails, totalFee: parseFloat(e.target.value) })}
            />
          </label>
          <label>
            <strong>Notes:</strong>
            <textarea
              name="notes"
              rows="4"
              cols="50"
              value={updatedBookingDetails.notes}
              onChange={(e) => setUpdatedBookingDetails({ ...updatedBookingDetails, notes: e.target.value })}
              style={{ width: '100%', height: '150px', padding: '10px', boxSizing: 'border-box', resize: 'none' }}
            />
          </label>
        </div>
        <div className="modal-footer">
          <button className="update-btn" onClick={handleUpdate}>Save</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BookingUpdateModal;