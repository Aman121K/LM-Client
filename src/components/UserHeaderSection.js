import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserHeaderSection.css';
import goRealtorsLogo from './goRealtors.jpg';

const UserHeaderSection = () => {
  const navigate = useNavigate();
  const { user, logout, userType } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBrochuresClick = () => {
    window.open('https://drive.google.com/drive/folders/1-PJ-dHRMbzKurFNlS4GrLY1r-t6ZkuFQ', '_blank');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="user-header">
      <div className="user-header-left">
        <img
          src={goRealtorsLogo}
          alt="Go Realtors"
          className="logo-image"
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Mobile Menu Button */}
      <button className="mobile-menu-button" onClick={toggleMenu}>
        <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`user-header-right ${isMenuOpen ? 'mobile-open' : ''}`}>
        <div className="user-info">
          <span className="username">Welcome, {user || 'User'}</span>
        </div>
        <div className="user-actions">
          <button onClick={handleBrochuresClick} className="action-btn brochures-btn">
            Show Brochures Details
          </button>
          <button onClick={() => navigate('/report')} className="action-btn brochures-btn">
            Reports
          </button>
          {userType=='tl' && (
            <button onClick={() => navigate('/user-leads')} className="action-btn brochures-btn">
              User's Lead
            </button>
          )}
          <button onClick={() => navigate('/resale-leads')} className="action-btn brochures-btn">
            Re-Sale Lead
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