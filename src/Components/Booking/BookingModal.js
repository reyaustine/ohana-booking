import React, { useState, useEffect } from 'react';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [renterDetails, setRenterDetails] = useState({
    name: '',
    idType: 'Driver\'s License',
    mobile: '',
    address: '',
    birthday: '',
    gender: 'Male'
  });
  const [bookingDetails, setBookingDetails] = useState({
    vehicle: '',
    rentDate: '',
    hours: '',
    location: 'Pickup',
    deliveryAddress: 'Ohana Bulacao Office HQ',
    deliveryFee: '',
    payment: 'Full',
    modeOfPayment: 'Cash',
    downPayment: '',
    carWashFee: 300,
  });
  const [errors, setErrors] = useState({});
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [isFullImageVisible, setIsFullImageVisible] = useState(false);
  const [totalFee, setTotalFee] = useState(0);

  useEffect(() => {
    if (currentTab === 1) {
      setIsNextEnabled(validateRenterDetails());
    } else if (currentTab === 2) {
      setIsNextEnabled(validateBookingDetails());
    }
  }, [renterDetails, bookingDetails, currentTab]);

  useEffect(() => {
    calculateTotalFee();
  }, [bookingDetails]);

  const validateRenterDetails = () => {
    const newErrors = {};
    if (!renterDetails.name) newErrors.name = 'Name is required';
    if (!renterDetails.idType) newErrors.idType = 'ID type is required';
    if (!renterDetails.mobile) newErrors.mobile = 'Mobile number is required';
    if (!renterDetails.address) newErrors.address = 'Address is required';
    if (!renterDetails.birthday) newErrors.birthday = 'Birthday is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBookingDetails = () => {
    const newErrors = {};
    if (!bookingDetails.vehicle) newErrors.vehicle = 'Vehicle is required';
    if (!bookingDetails.rentDate) newErrors.rentDate = 'Rent Date is required';
    if (!bookingDetails.hours || bookingDetails.hours < 12) newErrors.hours = 'Minimum hours are 12';
    if (!bookingDetails.location) newErrors.location = 'Location is required';
    if (bookingDetails.location === 'Delivery' && !bookingDetails.deliveryFee) newErrors.deliveryFee = 'Delivery fee is required';
    if (!bookingDetails.payment) newErrors.payment = 'Payment is required';
    if (bookingDetails.payment === 'Downpayment' && !bookingDetails.downPayment) newErrors.downPayment = 'Downpayment amount is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleBooking = () => {
    alert('Booking completed successfully!');
    // Reset fields
    setRenterDetails({
      name: '',
      idType: 'Driver\'s License',
      mobile: '',
      address: '',
      birthday: '',
      gender: 'Male'
    });
    setBookingDetails({
      vehicle: '',
      rentDate: '',
      hours: '',
      location: 'Pickup',
      deliveryAddress: 'Ohana Bulacao Office HQ',
      deliveryFee: '',
      payment: 'Full',
      modeOfPayment: 'Cash',
      downPayment: '',
      carWashFee: 300,
    });
    setErrors({});
    setIsNextEnabled(false);
    setCurrentTab(1);
    setTotalFee(0);
    onClose();
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    setUploadFile(URL.createObjectURL(file));
  };

  const handlePaymentProofUpload = (event) => {
    const file = event.target.files[0];
    setPaymentProof(URL.createObjectURL(file));
  };

  const calculateTotalFee = () => {
    const vehicleRate = bookingDetails.vehicle === 'Vehicle A' ? (bookingDetails.hours <= 12 ? 998 : 1600) : 0;
    const { hours, deliveryFee, downPayment, carWashFee } = bookingDetails;
    const total = (vehicleRate) + parseFloat(deliveryFee || 0) + parseFloat(carWashFee || 0) - parseFloat(downPayment || 0);
    setTotalFee(total);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{currentTab === 1 ? 'Renter Details Info' : currentTab === 2 ? 'Booking Details' : 'Recap'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
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
                <label htmlFor="idType">ID Type</label>
                <select
                  id="idType"
                  value={renterDetails.idType}
                  onChange={(e) => setRenterDetails({ ...renterDetails, idType: e.target.value })}
                >
                  <option value="Driver's License">Driver's License</option>
                  <option value="UMID">UMID</option>
                  <option value="SSS">SSS</option>
                  <option value="TIN">TIN</option>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                </select>
                {errors.idType && <span className="error">{errors.idType}</span>}
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
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  value={renterDetails.address}
                  onChange={(e) => setRenterDetails({ ...renterDetails, address: e.target.value })}
                />
                {errors.address && <span className="error">{errors.address}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="birthday">Birthday</label>
                <input
                  type="date"
                  id="birthday"
                  value={renterDetails.birthday}
                  onChange={(e) => setRenterDetails({ ...renterDetails, birthday: e.target.value })}
                />
                {errors.birthday && <span className="error">{errors.birthday}</span>}
              </div>
              <div className="form-group">
                <label>Gender</label>
                <div>
                  <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="Male"
                    checked={renterDetails.gender === 'Male'}
                    onChange={(e) => setRenterDetails({ ...renterDetails, gender: e.target.value })}
                  />
                  <label htmlFor="male">Male</label>
                  <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="Female"
                    checked={renterDetails.gender === 'Female'}
                    onChange={(e) => setRenterDetails({ ...renterDetails, gender: e.target.value })}
                  />
                  <label htmlFor="female">Female</label>
                </div>
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
              {isFullImageVisible && (
                <div className="full-image-overlay" onClick={() => setIsFullImageVisible(false)}>
                  <div className="full-image-container">
                    <button className="close-btn" onClick={() => setIsFullImageVisible(false)}>&times;</button>
                    <img src={uploadFile} alt="Full Uploaded ID" className="full-image" />
                  </div>
                </div>
              )}
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
                  {/* Placeholder options, to be replaced with actual data from Firebase */}
                  <option value="">Select a vehicle</option>
                  <option value="Vehicle A">Vehicle A</option>
                  <option value="Vehicle B">Vehicle B</option>
                  <option value="Vehicle C">Vehicle C</option>
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
                <label htmlFor="hours">Hours</label>
                <input
                  type="number"
                  id="hours"
                  value={bookingDetails.hours}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, hours: e.target.value })}
                />
                {errors.hours && <span className="error">{errors.hours}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <select
                  id="location"
                  value={bookingDetails.location}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, location: e.target.value })}
                >
                  <option value="Pickup">Pickup</option>
                  <option value="Delivery">Delivery</option>
                </select>
                {errors.location && <span className="error">{errors.location}</span>}
              </div>
              {bookingDetails.location === 'Delivery' && (
                <>
                  <div className="form-group">
                    <label htmlFor="deliveryAddress">Delivery Address</label>
                    <input
                      type="text"
                      id="deliveryAddress"
                      value={bookingDetails.deliveryAddress}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, deliveryAddress: e.target.value })}
                    />
                    {errors.deliveryAddress && <span className="error">{errors.deliveryAddress}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="deliveryFee">Delivery Fee</label>
                    <input
                      type="number"
                      id="deliveryFee"
                      value={bookingDetails.deliveryFee}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, deliveryFee: e.target.value })}
                    />
                    {errors.deliveryFee && <span className="error">{errors.deliveryFee}</span>}
                  </div>
                </>
              )}
              {bookingDetails.location === 'Pickup' && (
                <div className="form-group">
                  <label htmlFor="deliveryAddress">Pickup Address</label>
                  <input
                    type="text"
                    id="deliveryAddress"
                    value="Ohana Bulacao Office HQ"
                    readOnly
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="payment">Payment</label>
                <select
                  id="payment"
                  value={bookingDetails.payment}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, payment: e.target.value })}
                >
                  <option value="Full">Full</option>
                  <option value="Downpayment">Downpayment</option>
                </select>
                {errors.payment && <span className="error">{errors.payment}</span>}
              </div>
              {bookingDetails.payment === 'Downpayment' && (
                <div className="form-group">
                  <label htmlFor="downPayment">Downpayment Amount</label>
                  <input
                    type="number"
                    id="downPayment"
                    value={bookingDetails.downPayment}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, downPayment: e.target.value })}
                  />
                  {errors.downPayment && <span className="error">{errors.downPayment}</span>}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="modeOfPayment">Mode of Payment</label>
                <select
                  id="modeOfPayment"
                  value={bookingDetails.modeOfPayment}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, modeOfPayment: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Gcash">Gcash</option>
                </select>
                {errors.modeOfPayment && <span className="error">{errors.modeOfPayment}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="paymentProof">Upload Payment Proof</label>
                <input type="file" id="paymentProof" onChange={handlePaymentProofUpload} accept="image/*" />
                {paymentProof && (
                  <div className="thumbnail-container" onClick={() => setIsFullImageVisible(true)}>
                    <img src={paymentProof} alt="Uploaded Payment Proof" className="thumbnail" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Car Wash Fee</label>
                <input type="number" value={bookingDetails.carWashFee} readOnly />
              </div>
              <div className="form-group">
                <label>Balance Fee</label>
                <input type="number" value={totalFee} readOnly />
              </div>
            </div>
          )}
          {currentTab === 3 && (
            <div className="tab-content">
              <h3>Recap</h3>
              <div className="recap-details">
                <p><strong>Renter Name:</strong> {renterDetails.name}</p>
                <p><strong>ID Type:</strong> {renterDetails.idType}</p>
                <p><strong>Mobile Number:</strong> {renterDetails.mobile}</p>
                <p><strong>Address:</strong> {renterDetails.address}</p>
                <p><strong>Birthday:</strong> {renterDetails.birthday}</p>
                <p><strong>Gender:</strong> {renterDetails.gender}</p>
                <p><strong>Vehicle:</strong> {bookingDetails.vehicle}</p>
                <p><strong>Rent Date:</strong> {bookingDetails.rentDate}</p>
                <p><strong>Hours:</strong> {bookingDetails.hours}</p>
                <p><strong>Location:</strong> {bookingDetails.location}</p>
                {bookingDetails.location === 'Delivery' && <p><strong>Delivery Address:</strong> {bookingDetails.deliveryAddress}</p>}
                {bookingDetails.location === 'Delivery' && <p><strong>Delivery Fee:</strong> {bookingDetails.deliveryFee}</p>}
                <p><strong>Payment:</strong> {bookingDetails.payment}</p>
                {bookingDetails.payment === 'Downpayment' && <p><strong>Downpayment Amount:</strong> {bookingDetails.downPayment}</p>}
                <p><strong>Mode of Payment:</strong> {bookingDetails.modeOfPayment}</p>
                {paymentProof && (
                  <div>
                    <strong>Uploaded Payment Proof:</strong>
                    <img src={paymentProof} alt="Uploaded Payment Proof" className="thumbnail" onClick={() => setIsFullImageVisible(true)} />
                  </div>
                )}
                <p><strong>Car Wash Fee:</strong> {bookingDetails.carWashFee}</p>
                <p><strong>Total Fee:</strong> {totalFee}</p>
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
    </div>
  );
};

export default BookingModal;