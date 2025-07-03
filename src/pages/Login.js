import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';
import './Login.css';
import goRealtorsLogo from '../components/goRealtors.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Convert userType to lowercase for consistent comparison
        const userType = result.userType?.toLowerCase();
        console.log("user type in login page?>",userType)
        
        // Navigate based on user type
        switch (userType) {
          case 'admin':
            navigate('/admin');
            break;
          case 'user':
            navigate('/dashboard');
            break;
          case 'tl':
            navigate('/TLdashboard');
            break;
          default:
            setError('Invalid user type');
            break;
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    setForgotPasswordLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordMessage('We sent a new password to your email. Please check your inbox.');
        setEmail('');
        // Close modal after 3 seconds
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordMessage('');
        }, 3000);
      } else {
        setForgotPasswordMessage(data.message || 'Failed to process request');
      }
    } catch (error) {
      setForgotPasswordMessage('An error occurred. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-logo">
          <img src={goRealtorsLogo} alt="Go Realtors" className="logo-image" />
        </div>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="forgot-password-link">
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(true)}
              className="forgot-password-button"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>

      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Forgot Password</h2>
            {forgotPasswordMessage && (
              <div className={`message ${forgotPasswordMessage.includes('sent') ? 'success' : 'error'}`}>
                {forgotPasswordMessage}
              </div>
            )}
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <div className="modal-buttons">
                <button 
                  type="submit" 
                  disabled={forgotPasswordLoading}
                  className="submit-button"
                >
                  {forgotPasswordLoading ? 'Sending...' : 'Send Password'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 