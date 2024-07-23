import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Adjust the path as needed
import './VehiclesPage.css';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    makeModel: '',
    year: '2024',
    color: '',
    fuelType: 'Gas',
    engineNumber: '',
    chasisNumber: '',
    registrationDate: '',
    drive: 'FWD',
    doors: '',
    passengers: '',
    gpsInstalled: 'Yes',
    active: 'Yes',
    rented: 'No',
    renterNameId: [],
    rentedHours: null,
    notes: null,
    underMaintenance: 'No',
    repairs: [],
    addedBy: 'Admin User',
    addedDate: Timestamp.now(),
    updatedBy: 'N/A',
    updatedDate: 'N/A'
  });

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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prevVehicle) => ({ ...prevVehicle, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVehicle((prevVehicle) => ({ ...prevVehicle, [name]: value }));
  };

  const handleSaveVehicle = async () => {
    try {
      await addDoc(collection(db, 'vehicles'), newVehicle);
      setIsModalOpen(false);
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const vehicleData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error adding vehicle: ', error);
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      const vehicleRef = doc(db, 'vehicles', currentVehicle.id);
      await updateDoc(vehicleRef, {
        ...currentVehicle,
        updatedBy: auth.currentUser.email,
        updatedDate: Timestamp.now()
      });
      setIsEditModalOpen(false);
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const vehicleData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error updating vehicle: ', error);
    }
  };

  const renderVehicleCards = (status) => {
    return vehicles
      .filter(vehicle => vehicle.status === status)
      .map(vehicle => (
        <div key={vehicle.id} className="vehicle-card">
          <h3>{vehicle.name}</h3>
          {status === 'Rented' && <p>Renter: {vehicle.renter}</p>}
          {status === 'Maintenance' && <p>Notes: {vehicle.notes}</p>}
          {status === 'Issue' && <p>Issue: {vehicle.issue}</p>}
        </div>
      ));
  };

  const handleVehicleClick = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  return (
    <div className="vehicles-page">
      <div className="vehicles-section">
        <h2>Rented Vehicles</h2>
        <div className="vehicle-cards">{renderVehicleCards('Rented')}</div>
      </div>
      <div className="vehicles-section">
        <h2>Available Vehicles</h2>
        <div className="vehicle-cards">
          {vehicles
            .filter(vehicle => vehicle.active === 'Yes' && vehicle.rented === 'No' && vehicle.underMaintenance === 'No')
            .map(vehicle => (
              <div key={vehicle.id} className="vehicle-card" onClick={() => handleVehicleClick(vehicle)}>
                <h3>{vehicle.name}</h3>
              </div>
            ))}
        </div>
      </div>
      <div className="vehicles-section">
        <h2>Repair/Maintenance Vehicles</h2>
        <div className="vehicle-cards">{renderVehicleCards('Maintenance')}</div>
      </div>
      <div className="vehicles-section">
        <h2>Recent Repairs and Issues</h2>
        <div className="vehicle-cards">{renderVehicleCards('Issue')}</div>
      </div>
      <button className="fab-booking" onClick={() => setIsModalOpen(true)}>
        <i className="fas fa-car"></i>
        <span>Add Vehicle</span>
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Vehicle</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="name">Vehicle Name</label>
                <input type="text" id="name" name="name" value={newVehicle.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="makeModel">Make and Model</label>
                <input type="text" id="makeModel" name="makeModel" value={newVehicle.makeModel} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <select id="year" name="year" value={newVehicle.year} onChange={handleInputChange}>
                  {Array.from({ length: 61 }, (_, i) => 1990 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input type="text" id="color" name="color" value={newVehicle.color} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="fuelType">Fuel Type</label>
                <select id="fuelType" name="fuelType" value={newVehicle.fuelType} onChange={handleInputChange}>
                  <option value="Gas">Gas</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="engineNumber">Engine Number</label>
                <input type="text" id="engineNumber" name="engineNumber" value={newVehicle.engineNumber} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="chasisNumber">Chasis Number</label>
                <input type="text" id="chasisNumber" name="chasisNumber" value={newVehicle.chasisNumber} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="registrationDate">Registration Date</label>
                <input type="date" id="registrationDate" name="registrationDate" value={newVehicle.registrationDate} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="drive">Drive</label>
                <select id="drive" name="drive" value={newVehicle.drive} onChange={handleInputChange}>
                  <option value="FWD">FWD</option>
                  <option value="AWD">AWD</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="doors">Doors</label>
                <input type="text" id="doors" name="doors" value={newVehicle.doors} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="passengers">Passengers</label>
                <input type="text" id="passengers" name="passengers" value={newVehicle.passengers} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="gpsInstalled">GPS Installed</label>
                <select id="gpsInstalled" name="gpsInstalled" value={newVehicle.gpsInstalled} onChange={handleInputChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="active">Active</label>
                <select id="active" name="active" value={newVehicle.active} onChange={handleInputChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSaveVehicle}>Save Vehicle</button>
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Vehicle</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="name">Vehicle Name</label>
                <input type="text" id="name" name="name" value={currentVehicle.name} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="makeModel">Make and Model</label>
                <input type="text" id="makeModel" name="makeModel" value={currentVehicle.makeModel} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <select id="year" name="year" value={currentVehicle.year} onChange={handleEditInputChange}>
                  {Array.from({ length: 61 }, (_, i) => 1990 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input type="text" id="color" name="color" value={currentVehicle.color} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="fuelType">Fuel Type</label>
                <select id="fuelType" name="fuelType" value={currentVehicle.fuelType} onChange={handleEditInputChange}>
                  <option value="Gas">Gas</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="engineNumber">Engine Number</label>
                <input type="text" id="engineNumber" name="engineNumber" value={currentVehicle.engineNumber} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="chasisNumber">Chasis Number</label>
                <input type="text" id="chasisNumber" name="chasisNumber" value={currentVehicle.chasisNumber} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="registrationDate">Registration Date</label>
                <input type="date" id="registrationDate" name="registrationDate" value={currentVehicle.registrationDate} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="drive">Drive</label>
                <select id="drive" name="drive" value={currentVehicle.drive} onChange={handleEditInputChange}>
                  <option value="FWD">FWD</option>
                  <option value="AWD">AWD</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="doors">Doors</label>
                <input type="text" id="doors" name="doors" value={currentVehicle.doors} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="passengers">Passengers</label>
                <input type="text" id="passengers" name="passengers" value={currentVehicle.passengers} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="gpsInstalled">GPS Installed</label>
                <select id="gpsInstalled" name="gpsInstalled" value={currentVehicle.gpsInstalled} onChange={handleEditInputChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="active">Active</label>
                <select id="active" name="active" value={currentVehicle.active} onChange={handleEditInputChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="rented">Rented</label>
                <select id="rented" name="rented" value={currentVehicle.rented} onChange={handleEditInputChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="underMaintenance">Under Maintenance</label>
                <select id="underMaintenance" name="underMaintenance" value={currentVehicle.underMaintenance} onChange={handleEditInputChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="repairs">Repairs</label>
                <textarea id="repairs" name="repairs" value={currentVehicle.repairs} onChange={handleEditInputChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleUpdateVehicle}>Save Changes</button>
              <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;