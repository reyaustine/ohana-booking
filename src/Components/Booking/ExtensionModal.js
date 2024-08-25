import React, { useState } from 'react';
import './ExtensionModal.css';

const ExtensionModal = ({ isOpen, onClose, onExtend }) => {
  const [extensionHours, setExtensionHours] = useState('');
  const [additionalFee, setAdditionalFee] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onExtend(extensionHours, additionalFee);
    setExtensionHours('');
    setAdditionalFee('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Extend Booking</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="form-group">
              <label htmlFor="extensionHours">Extension Hours:</label>
              <input
                type="number"
                id="extensionHours"
                value={extensionHours}
                onChange={(e) => setExtensionHours(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="additionalFee">Additional Fee:</label>
              <input
                type="number"
                id="additionalFee"
                value={additionalFee}
                onChange={(e) => setAdditionalFee(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="extend-btn">Extend</button>
            <button type="button" className="close-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExtensionModal;