import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminHeaderSection.css';

const AdminHeaderSection = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/create-user', label: 'Create User', icon: '👤' },
    { path: '/all-users', label: 'All Users', icon: '👥' },
    { path: '/operator-report', label: 'Reports', icon: '📈' },
    { path: '/admin-day-wise', label: 'Day Wise', icon: '📅' },
    { path: '/call-status-statistics', label: 'Statistics', icon: '📊' },
    { path: '/upload', label: 'Upload', icon: '📤' }
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="header-mobile">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <h1 className="header-title">Admin Panel</h1>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.FullName || 'Admin'}</span>
              <button 
                className="logout-btn-mobile"
                onClick={handleLogout}
                aria-label="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`sidebar-overlay ${showSidebar ? 'open' : ''}`} onClick={closeSidebar}></div>
      <aside className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Admin Panel</h2>
          <button 
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <h3 className="user-name">{user?.FullName || 'Admin'}</h3>
            <p className="user-role">{user?.usertype || 'Administrator'}</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`sidebar-nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </a>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button 
            className="btn btn-outline btn-block"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Desktop Header */}
      <header className="header-desktop hidden-mobile">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="header-title">Admin Panel</h1>
              <nav className="header-nav">
                {navigationItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="header-right">
              <div className="user-info">
                <span className="user-name">{user?.FullName || 'Admin'}</span>
                <span className="user-role">{user?.usertype || 'Administrator'}</span>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="nav-mobile hidden-desktop">
        {navigationItems.slice(0, 5).map((item) => (
          <div key={item.path} className="nav-item">
            <a
              href={item.path}
              className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </a>
          </div>
        ))}
      </nav>
    </>
  );
};

export default AdminHeaderSection; 