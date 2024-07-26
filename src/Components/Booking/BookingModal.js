import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, currentUser, selectedDate }) => {
  const [vehicles, setVehicles] = useState([]);
  const [currentTab, setCurrentTab] = useState(1);
  const [renterDetails, setRenterDetails] = useState({
    name: '',
    mobile: '',
  });
  const [bookingDetails, setBookingDetails] = useState({
    vehicle: '',
    rentDate: '',
    rentTime: '',
    rentDuration: '',
    payment: 'Cash',
    totalFee: '',
    notes: '',
    returnDate: '',
  });
  const [errors, setErrors] = useState({});
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [isFullImageVisible, setIsFullImageVisible] = useState(false);
  const [bookingID, setBookingID] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const vehicleData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVehicles(vehicleData);
    };

    fetchVehicles();
    generateBookingID();
  }, []);

  const validateRenterDetails = useCallback(() => {
    const newErrors = {};
    if (!renterDetails.name) newErrors.name = 'Name is required';
    if (!renterDetails.mobile) newErrors.mobile = 'Mobile number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [renterDetails]);

  const validateBookingDetails = useCallback(() => {
    const newErrors = {};
    if (!bookingDetails.vehicle) newErrors.vehicle = 'Vehicle is required';
    if (!bookingDetails.rentDate) newErrors.rentDate = 'Rent Date is required';
    if (!bookingDetails.rentTime) newErrors.rentTime = 'Rent Time is required';
    if (!bookingDetails.rentDuration || bookingDetails.rentDuration < 1) newErrors.rentDuration = 'Minimum duration is 1 hour';
    if (!bookingDetails.totalFee) newErrors.totalFee = 'Total Fee is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [bookingDetails]);

  useEffect(() => {
    if (currentTab === 1) {
      setIsNextEnabled(validateRenterDetails());
    } else if (currentTab === 2) {
      setIsNextEnabled(validateBookingDetails());
    }
  }, [renterDetails, bookingDetails, currentTab, validateRenterDetails, validateBookingDetails]);

  const calculateReturnDate = useCallback(() => {
    try {
      const rentDateTime = new Date(`${bookingDetails.rentDate}T${bookingDetails.rentTime}`);
      const returnDateTime = new Date(rentDateTime.getTime() + bookingDetails.rentDuration * 60 * 60 * 1000);
      setBookingDetails(prevDetails => ({ ...prevDetails, returnDate: returnDateTime.toISOString() }));
    } catch (error) {
      console.error("Error calculating return date: ", error);
    }
  }, [bookingDetails.rentDate, bookingDetails.rentTime, bookingDetails.rentDuration]);

  useEffect(() => {
    if (bookingDetails.rentDate && bookingDetails.rentTime && bookingDetails.rentDuration) {
      calculateReturnDate();
    }
  }, [bookingDetails.rentDate, bookingDetails.rentTime, bookingDetails.rentDuration, calculateReturnDate]);

  useEffect(() => {
    if (selectedDate) {
      const date = selectedDate.toISOString().split('T')[0];
      setBookingDetails((prevDetails) => ({
        ...prevDetails,
        rentDate: date,
        rentTime: '00:00',
      }));
    }
  }, [selectedDate]);

  const generateBookingID = async () => {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookingCount = querySnapshot.size + 1;
    setBookingID(`BOOKINGID#${String(bookingCount).padStart(4, '0')}`);
  };

  const handleNext = () => {
    if (currentTab === 1 && validateRenterDetails()) {
      setCurrentTab(2);
    } else if (currentTab === 2 && validateBookingDetails()) {
      setCurrentTab(3);
    }
  };

  const handlePrevious = () => {
    if (currentTab > 1) {
      setCurrentTab(currentTab - 1);
    }
  };

  const handleBooking = async () => {
    try {
      await setDoc(doc(db, 'bookings', bookingID), {
        bookingID,
        renterDetails,
        bookingDetails: {
          ...bookingDetails,
          rentDate: `${bookingDetails.rentDate} ${bookingDetails.rentTime}`,
          returnDate: bookingDetails.returnDate
        },
        createdAt: new Date(),
        savedBy: currentUser || 'Unknown',
        updatedBy: 'N/A',
        updatedDate: 'N/A',
        active: 'Yes',
        paymentProof,
        uploadFile
      });
      alert('Booking completed successfully!');
      // Reset all fields
      setRenterDetails({ name: '', mobile: '' });
      setBookingDetails({
        vehicle: '',
        rentDate: '',
        rentTime: '',
        rentDuration: '',
        payment: 'Cash',
        totalFee: '',
        notes: '',
        returnDate: ''
      });
      setErrors({});
      setIsNextEnabled(false);
      setCurrentTab(1);
      setBookingID('');
      setUploadFile(null);
      setPaymentProof(null);
      generateBookingID(); // Generate a new booking ID for the next booking
      onClose();
    } catch (error) {
      console.error('Error saving booking: ', error);
      alert('There was an error saving the booking. Please try again.');
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    setUploadFile(URL.createObjectURL(file));
  };

  const handlePaymentProofUpload = (event) => {
    const file = event.target.files[0];
    setPaymentProof(URL.createObjectURL(file));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{currentTab === 1 ? 'Renter Details Info' : currentTab === 2 ? 'Booking Details' : 'Booking Recap'}</h2>
          <button className="close-btn-booking" onClick={onClose}>X</button>
        </div>
        <div className="modal-content">
          {currentTab === 1 && (
            <div className="tab-content">
              <div className="form-group">
                <label htmlFor="name">Renter Name</label>
                <input
                  type="text"
                  id="name"
                  value={renterDetails.name}
                  onChange={(e) => setRenterDetails({ ...renterDetails, name: e.target.value })}
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="text"
                  id="mobile"
                  value={renterDetails.mobile}
                  onChange={(e) => setRenterDetails({ ...renterDetails, mobile: e.target.value })}
                />
                {errors.mobile && <span className="error">{errors.mobile}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="upload">Upload ID</label>
                <input type="file" id="upload" onChange={handleUpload} accept="image/*" />
                {uploadFile && (
                  <div className="thumbnail-container" onClick={() => setIsFullImageVisible(true)}>
                    <img src={uploadFile} alt="Uploaded ID" className="thumbnail" />
                  </div>
                )}
              </div>
            </div>
          )}
          {currentTab === 2 && (
            <div className="tab-content">
              <div className="form-group">
                <label htmlFor="vehicle">Vehicle</label>
                <select
                  id="vehicle"
                  value={bookingDetails.vehicle}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, vehicle: e.target.value })}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.name}>{vehicle.name}</option>
                  ))}
                </select>
                {errors.vehicle && <span className="error">{errors.vehicle}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="rentDate">Rent Date</label>
                <input
                  type="date"
                  id="rentDate"
                  value={bookingDetails.rentDate}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, rentDate: e.target.value })}
                />
                {errors.rentDate && <span className="error">{errors.rentDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="rentTime">Rent Time</label>
                <input
                  type="time"
                  id="rentTime"
                  value={bookingDetails.rentTime}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, rentTime: e.target.value })}
                />
                {errors.rentTime && <span className="error">{errors.rentTime}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="rentDuration">Rent Duration (Hours)</label>
                <input
                  type="number"
                  id="rentDuration"
                  value={bookingDetails.rentDuration}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, rentDuration: e.target.value })}
                />
                {errors.rentDuration && <span className="error">{errors.rentDuration}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="totalFee">Total Amount to Pay</label>
                <input
                  type="number"
                  id="totalFee"
                  value={bookingDetails.totalFee}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, totalFee: e.target.value })}
                />
                {errors.totalFee && <span className="error">{errors.totalFee}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="modeOfPayment">Mode of Payment</label>
                <select
                  id="modeOfPayment"
                  value={bookingDetails.payment}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, payment: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Gcash">Gcash</option>
                </select>
                {errors.payment && <span className="error">{errors.payment}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="paymentProof">Proof of Payment</label>
                <input type="file" id="paymentProof" onChange={handlePaymentProofUpload} accept="image/*" />
                {paymentProof && (
                  <div className="thumbnail-container" onClick={() => setIsFullImageVisible(true)}>
                    <img src={paymentProof} alt="Uploaded Payment Proof" className="thumbnail" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  rows="4"
                  cols="50"
                  value={bookingDetails.notes}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="returnDate">Return Date & Time</label>
                <input type="text" value={new Date(bookingDetails.returnDate).toLocaleString()} readOnly />
              </div>
            </div>
          )}
          {currentTab === 3 && (
            <div className="tab-content">
              <div className="recap-details">
                <p><strong>Booking ID:</strong> {bookingID}</p>
                <p><strong>Renter Name:</strong> {renterDetails.name}</p>
                <p><strong>Mobile Number:</strong> {renterDetails.mobile}</p>
                <p><strong>Vehicle:</strong> {bookingDetails.vehicle}</p>
                <p><strong>Rent Date:</strong> {bookingDetails.rentDate} {bookingDetails.rentTime}</p>
                <p><strong>Rent Duration:</strong> {bookingDetails.rentDuration} hours</p>
                <p><strong>Total Amount to Pay:</strong> {bookingDetails.totalFee}</p>
                <p><strong>Mode of Payment:</strong> {bookingDetails.payment}</p>
                {paymentProof && (
                  <div>
                    <strong>Uploaded Payment Proof:</strong>
                    <img src={paymentProof} alt="Uploaded Payment Proof" className="thumbnail" onClick={() => setIsFullImageVisible(true)} />
                  </div>
                )}
                <p><strong>Notes:</strong> {bookingDetails.notes}</p>
                <p><strong>Return Date & Time:</strong> {new Date(bookingDetails.returnDate).toLocaleString()}</p>
                {uploadFile && (
                  <div>
                    <strong>Uploaded ID:</strong>
                    <img src={uploadFile} alt="Uploaded ID" className="thumbnail" onClick={() => setIsFullImageVisible(true)} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {currentTab > 1 && (
            <button className="prev-btn" onClick={handlePrevious}>
              Previous
            </button>
          )}
          <button
            className={`next-btn ${isNextEnabled ? 'enabled' : ''}`}
            onClick={currentTab === 3 ? handleBooking : handleNext}
            disabled={!isNextEnabled}
          >
            {currentTab === 3 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
      {isFullImageVisible && (
        <div className="full-image-overlay" onClick={() => setIsFullImageVisible(false)}>
          <div className="full-image-container">
            <button className="close-btn" onClick={() => setIsFullImageVisible(false)}>&times;</button>
            <img src={uploadFile || paymentProof} alt="Full size" className="full-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingModal;