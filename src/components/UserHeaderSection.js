import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserHeaderSection.css';
import goRealtorsLogo from './goRealtors.jpg';

const UserHeaderSection = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBrochuresClick = () => {
    window.open('https://drive.google.com/drive/folders/1-PJ-dHRMbzKurFNlS4GrLY1r-t6ZkuFQ', '_blank');
  };

  return (
    <div className="user-header">
      <div className="user-header-left">
        <img 
          src={goRealtorsLogo} 
          alt="Go Realtors" 
          className="logo-image" 
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <div className="user-header-right">
        <div className="user-info">
          <span className="username">Welcome, {user || 'User'}</span>
        </div>
        <div className="user-actions">
          <button onClick={handleBrochuresClick} className="action-btn brochures-btn">
            Show Brochures Details
          </button>
          <button onClick={() => navigate('/report')} className="action-btn">
            Reports
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHeaderSection; 