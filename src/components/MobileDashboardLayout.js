import React, { useState } from 'react';
import './MobileDashboardLayout.css';

const MobileDashboardLayout = ({ children, title, subtitle, actions, stats, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="mobile-dashboard-layout">
      {/* Mobile Header */}
      <div className="mobile-dashboard-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="dashboard-title">{title}</h1>
            {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
          </div>
          
          <div className="header-actions">
            {actions && actions.length > 0 && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowActions(!showActions)}
              >
                {showActions ? 'Hide' : 'Actions'}
              </button>
            )}
            
            {filters && filters.length > 0 && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Filters'}
              </button>
            )}
          </div>
        </div>
        
        {/* Collapsible Actions */}
        {actions && actions.length > 0 && showActions && (
          <div className="collapsible-actions">
            <div className="actions-grid">
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={`btn ${action.variant || 'btn-primary'} btn-sm action-btn`}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon && <span className="action-icon">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Collapsible Filters */}
        {filters && filters.length > 0 && showFilters && (
          <div className="collapsible-filters">
            <div className="filters-grid">
              {filters.map((filter, index) => (
                <div key={index} className="filter-item">
                  {filter.type === 'select' ? (
                    <select 
                      className="form-control filter-select"
                      value={filter.value}
                      onChange={filter.onChange}
                    >
                      {filter.options.map((option, optIndex) => (
                        <option key={optIndex} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'date' ? (
                    <input
                      type="date"
                      className="form-control filter-date"
                      value={filter.value}
                      onChange={filter.onChange}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control filter-input"
                      placeholder={filter.placeholder}
                      value={filter.value}
                      onChange={filter.onChange}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                {stat.trend && (
                  <div className={`stat-trend ${stat.trend > 0 ? 'positive' : 'negative'}`}>
                    {stat.trend > 0 ? '↗' : '↘'} {Math.abs(stat.trend)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mobile-dashboard-content">
        {children}
      </div>

      {/* Mobile Footer */}
      <div className="mobile-dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span className="footer-text">Swipe to see more</span>
          </div>
          <div className="footer-actions">
            <button className="btn btn-outline btn-sm" onClick={() => window.scrollTo(0, 0)}>
              ↑ Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboardLayout;
