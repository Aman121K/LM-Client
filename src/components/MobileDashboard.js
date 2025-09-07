import React, { useState, useEffect } from 'react';
import './MobileDashboard.css';

const MobileDashboard = ({
  title = 'Dashboard',
  subtitle = 'Overview and insights',
  stats = [],
  quickActions = [],
  recentActivity = [],
  charts = [],
  loading = false,
  onRefresh,
  onActionClick
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleActionClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  const renderStats = () => (
    <div className="dashboard-stats">
      <div className="stats-header">
        <h3 className="stats-title">📊 Key Metrics</h3>
        <span className="stats-subtitle">Real-time data</span>
      </div>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.trend || ''}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              {stat.trend && (
                <div className={`stat-trend ${stat.trend}`}>
                  {stat.trend === 'up' ? '↗️' : '↘️'} {stat.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className="dashboard-quick-actions">
      <div className="quick-actions-header">
        <h3 className="quick-actions-title">⚡ Quick Actions</h3>
        <button
          className="toggle-actions-btn"
          onClick={() => setShowQuickActions(!showQuickActions)}
          aria-label={showQuickActions ? 'Hide actions' : 'Show actions'}
        >
          {showQuickActions ? '🔽' : '🔼'}
        </button>
      </div>
      
      {showQuickActions && (
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`quick-action-btn ${action.type || 'default'}`}
              onClick={() => handleActionClick(action)}
              aria-label={action.label}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
              {action.badge && (
                <span className="action-badge">{action.badge}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderRecentActivity = () => (
    <div className="dashboard-recent-activity">
      <div className="recent-activity-header">
        <h3 className="recent-activity-title">🕒 Recent Activity</h3>
        <span className="recent-activity-subtitle">Latest updates</span>
      </div>
      
      <div className="activity-list">
        {recentActivity.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">{activity.icon}</div>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              <div className="activity-description">{activity.description}</div>
              <div className="activity-time">{activity.time}</div>
            </div>
            {activity.status && (
              <div className={`activity-status ${activity.status}`}>
                {activity.status === 'success' ? '✅' : 
                 activity.status === 'warning' ? '⚠️' : 
                 activity.status === 'error' ? '❌' : 'ℹ️'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="dashboard-charts">
      <div className="charts-header">
        <h3 className="charts-title">📈 Analytics</h3>
        <span className="charts-subtitle">Visual insights</span>
      </div>
      
      <div className="charts-grid">
        {charts.map((chart, index) => (
          <div key={index} className="chart-card">
            <div className="chart-header">
              <h4 className="chart-title">{chart.title}</h4>
              <div className="chart-actions">
                {chart.actions?.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    className="chart-action-btn"
                    onClick={() => handleActionClick(action)}
                    aria-label={action.label}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-content">
              {chart.content || (
                <div className="chart-placeholder">
                  <span className="chart-placeholder-icon">📊</span>
                  <p className="chart-placeholder-text">{chart.placeholder || 'Chart data will appear here'}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="dashboard-tabs">
      <button
        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveTab('overview')}
        aria-label="Overview tab"
      >
        📋 Overview
      </button>
      <button
        className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => setActiveTab('analytics')}
        aria-label="Analytics tab"
      >
        📊 Analytics
      </button>
      <button
        className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
        onClick={() => setActiveTab('activity')}
        aria-label="Activity tab"
      >
        🕒 Activity
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
        <div className="loading-skeleton-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="loading-skeleton-card">
              <div className="loading-skeleton loading-skeleton-title"></div>
              <div className="loading-skeleton loading-skeleton-text"></div>
              <div className="loading-skeleton loading-skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-title-section">
            <h1 className="dashboard-title">{title}</h1>
            <p className="dashboard-subtitle">{subtitle}</p>
          </div>
          
          <div className="dashboard-header-actions">
            <div className="current-time">
              <span className="time-icon">🕐</span>
              <span className="time-value">{formatTime(currentTime)}</span>
              <span className="date-value">{formatDate(currentTime)}</span>
            </div>
            
            <button
              className="refresh-btn"
              onClick={onRefresh}
              aria-label="Refresh dashboard"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      {renderTabs()}

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <>
            {renderStats()}
            {renderQuickActions()}
            {renderRecentActivity()}
          </>
        )}
        
        {activeTab === 'analytics' && (
          <>
            {renderCharts()}
            {renderStats()}
          </>
        )}
        
        {activeTab === 'activity' && (
          <>
            {renderRecentActivity()}
            {renderQuickActions()}
          </>
        )}
      </div>

      {/* Dashboard Footer */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span className="footer-text">Last updated: {formatTime(currentTime)}</span>
            <span className="footer-text">•</span>
            <span className="footer-text">Data refreshes automatically</span>
          </div>
          
          <div className="footer-actions">
            <button
              className="footer-action-btn"
              onClick={() => setShowFilters(!showFilters)}
              aria-label={showFilters ? 'Hide filters' : 'Show filters'}
            >
              🔍 Filters
            </button>
            <button
              className="footer-action-btn"
              onClick={onRefresh}
              aria-label="Refresh data"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {/* Collapsible Filters */}
        {showFilters && (
          <div className="dashboard-filters">
            <div className="filters-content">
              <h4 className="filters-title">🔍 Dashboard Filters</h4>
              <div className="filters-grid">
                <div className="filter-item">
                  <label className="filter-label">Date Range</label>
                  <select className="filter-select" defaultValue="7d">
                    <option value="1d">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
                
                <div className="filter-item">
                  <label className="filter-label">Data Type</label>
                  <select className="filter-select" defaultValue="all">
                    <option value="all">All data</option>
                    <option value="users">Users only</option>
                    <option value="activity">Activity only</option>
                    <option value="analytics">Analytics only</option>
                  </select>
                </div>
                
                <div className="filter-item">
                  <label className="filter-label">Sort By</label>
                  <select className="filter-select" defaultValue="recent">
                    <option value="recent">Most recent</option>
                    <option value="name">Name</option>
                    <option value="value">Value</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
              
              <div className="filters-actions">
                <button className="btn btn-primary btn-sm">Apply Filters</button>
                <button className="btn btn-outline btn-sm">Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="dashboard-fab">
        <button
          className="fab-btn primary"
          onClick={() => setShowQuickActions(!showQuickActions)}
          aria-label="Quick actions"
        >
          ⚡
        </button>
        
        {showQuickActions && (
          <div className="fab-menu">
            {quickActions.slice(0, 3).map((action, index) => (
              <button
                key={index}
                className="fab-menu-item"
                onClick={() => handleActionClick(action)}
                aria-label={action.label}
              >
                <span className="fab-menu-icon">{action.icon}</span>
                <span className="fab-menu-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileDashboard;
