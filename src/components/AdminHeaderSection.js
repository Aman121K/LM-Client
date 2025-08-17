import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminHeaderSection.css';
import goRealtorsLogo from './goRealtors.jpg';
const AdminHeaderSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-header">
      <div className="admin-header-top">
      <div className="user-header-left" onClick={() => navigate('/admin')}>
        <img src={goRealtorsLogo} alt="Go Realtors" className="logo-image" />
      </div>
        <div className="admin-header-right">
          <div className="user-info">
            <span className="username"> Welcome, {localStorage.getItem('user')}</span>
          </div>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      
      <div className={`admin-actions-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin-day-wise')}>Day Wise Report</button>
          <button onClick={() => navigate('/admin/create-user')}>Create User</button>
          <button onClick={() => navigate('/all-users')}>View Users</button>
          <button onClick={() => navigate('/operator-report')}>Reports</button>
          <button onClick={() => navigate('/upload')}>Upload Data</button>
          <button onClick={() => navigate('/call-status-statistics')}>Call Status Statistics</button>
          {/* <button onClick={() => navigate('/export')}>Export Dat  a</button> */}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeaderSection; 