import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import './Login.css';
import carImage from '../../5.png'; 
import carImage2 from '../../3.png'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      console.log('User signed in successfully');
      navigate('/');
    } catch (error) {
      setError(error.message);
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="car-image-container">
        <img src={carImage} alt="Rental Car" className="car-image" />
        </div>
        <div className="login-form">
          <h1>Ohana</h1>
          <p>Cebu Car Rental</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="E-mail Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">LOG IN</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;