import React, { useEffect, useState } from 'react';
import AdminHeaderSection from '../components/AdminHeaderSection';
import { BASE_URL } from '../config';
import './CallStatusStatistics.css';

const CallStatusStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCallStatusStatistics();
  }, []);

  const fetchCallStatusStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/leads/all-call-status-statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.data);
        console.log('Raw API data:', data.data);
      } else {
        setError(data.message || 'Failed to fetch call status statistics');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('An error occurred while fetching call status statistics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'details shared': '#4CAF50',
      'Resale-buyer': '#2196F3',
      'warm': '#FF9800',
      'site visit planned': '#9C27B0',
      'site visit planned (this week)': '#E91E63',
      'site visit done': '#607D8B'
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'details shared': '📋',
      'Resale-buyer': '🏠',
      'warm': '🔥',
      'site visit planned': '📅',
      'site visit planned (this week)': '📆',
      'site visit done': '✅'
    };
    return icons[status] || '📊';
  };

  // Simple function to get count for any status variation
  const getCountForStatus = (user, statusKey) => {
    if (!user.callStatusCounts) return 0;
    return user.callStatusCounts[statusKey] || 0;
  };

  // Calculate totals using actual API data structure
  const calculateTotals = () => {
    if (!statistics || !statistics.userStatistics) return {};
    
    const totals = {
      'details shared': 0,
      'Resale-buyer': 0,
      'warm': 0,
      'site visit planned': 0,
      'site visit planned (this week)': 0,
      'site visit done': 0
    };
    
    statistics.userStatistics.forEach(user => {
      // Add all variations of each status
      totals['details shared'] += getCountForStatus(user, 'Details Shared') + getCountForStatus(user, 'details shared');
      totals['Resale-buyer'] += getCountForStatus(user, 'Resale-buyer') + getCountForStatus(user, 'Resale Buyer');
      totals['warm'] += getCountForStatus(user, 'Warm') + getCountForStatus(user, 'warm');
      totals['site visit planned'] += getCountForStatus(user, 'Site Visit Planned') + getCountForStatus(user, 'site visit planned');
      totals['site visit planned (this week)'] += getCountForStatus(user, 'Site Visit Planned (this week)') + getCountForStatus(user, 'site visit planned (this week)');
      totals['site visit done'] += getCountForStatus(user, 'Site Visit Done') + getCountForStatus(user, 'site visit done');
    });
    
    console.log('Calculated totals:', totals);
    return totals;
  };

  // Get display count for a user and status
  const getDisplayCount = (user, status) => {
    const variations = {
      'details shared': ['Details Shared', 'details shared'],
      'Resale-buyer': ['Resale-buyer', 'Resale Buyer'],
      'warm': ['Warm', 'warm'],
      'site visit planned': ['Site Visit Planned', 'site visit planned'],
      'site visit planned (this week)': ['Site Visit Planned (this week)', 'site visit planned (this week)'],
      'site visit done': ['Site Visit Done', 'site visit done']
    };
    
    let total = 0;
    if (variations[status]) {
      variations[status].forEach(variation => {
        total += getCountForStatus(user, variation);
      });
    }
    return total;
  };

  // Group users by Team Lead and sort alphabetically
  const groupUsersByTeamLead = () => {
    if (!statistics || !statistics.userStatistics) return {};
    
    const grouped = {};
    
    statistics.userStatistics.forEach(user => {
      const tlName = user.tlName || 'Not Assigned';
      if (!grouped[tlName]) {
        grouped[tlName] = [];
      }
      grouped[tlName].push(user);
    });
    
    // Sort users within each TL group alphabetically by fullName
    Object.keys(grouped).forEach(tlName => {
      grouped[tlName].sort((a, b) => a.fullName.localeCompare(b.fullName));
    });
    
    return grouped;
  };

  // Get sorted TL names
  const getSortedTeamLeadNames = () => {
    const grouped = groupUsersByTeamLead();
    return Object.keys(grouped).sort((a, b) => {
      // Put "Not Assigned" at the end
      if (a === 'Not Assigned') return 1;
      if (b === 'Not Assigned') return -1;
      return a.localeCompare(b);
    });
  };

  if (loading) {
    return (
      <div className="call-status-container">
        <AdminHeaderSection />
        <div className="call-status-content">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading call status statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="call-status-container">
        <AdminHeaderSection />
        <div className="call-status-content">
          <div className="error-message">
            <h3>Error Loading Statistics</h3>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={fetchCallStatusStatistics}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="call-status-container">
        <AdminHeaderSection />
        <div className="call-status-content">
          <div className="no-data">
            <h3>No Statistics Available</h3>
            <p>No call status statistics found.</p>
            <button 
              className="retry-btn"
              onClick={fetchCallStatusStatistics}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusTotals = calculateTotals();

  return (
    <div className="call-status-container">
      <AdminHeaderSection />
      
      <div className="call-status-content">
        <div className="page-header">
          <h2>Call Status Statistics</h2>
          <button 
            className="refresh-btn"
            onClick={fetchCallStatusStatistics}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-section">
          <div className="summary-card total-users">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>Total Users</h3>
              <p>{statistics.summary?.totalUsers || 0}</p>
            </div>
          </div>
          <div className="summary-card total-calls">
            <div className="card-icon">📞</div>
            <div className="card-content">
              <h3>Total Calls</h3>
              <p>{statistics.summary?.totalCalls || 0}</p>
            </div>
          </div>
        </div>

        {/* Call Status Overview */}
        <div className="status-overview">
          <h3>Call Status Overview</h3>
          <div className="status-grid">
            <div className="status-card" style={{ borderLeftColor: getStatusColor('details shared') }}>
              <div className="status-header">
                <span className="status-icon">{getStatusIcon('details shared')}</span>
                <span className="status-name">Details Shared</span>
              </div>
              <div className="status-count">{statusTotals['details shared']}</div>
              <div className="status-percentage">
                {statistics.summary?.totalCalls > 0 
                  ? ((statusTotals['details shared'] / statistics.summary.totalCalls) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            
            <div className="status-card" style={{ borderLeftColor: getStatusColor('warm') }}>
              <div className="status-header">
                <span className="status-icon">{getStatusIcon('warm')}</span>
                <span className="status-name">Warm</span>
              </div>
              <div className="status-count">{statusTotals['warm']}</div>
              <div className="status-percentage">
                {statistics.summary?.totalCalls > 0 
                  ? ((statusTotals['warm'] / statistics.summary.totalCalls) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            
            <div className="status-card" style={{ borderLeftColor: getStatusColor('site visit done') }}>
              <div className="status-header">
                <span className="status-icon">{getStatusIcon('site visit done')}</span>
                <span className="status-name">Site Visit Done</span>
              </div>
              <div className="status-count">{statusTotals['site visit done']}</div>
              <div className="status-percentage">
                {statistics.summary?.totalCalls > 0 
                  ? ((statusTotals['site visit done'] / statistics.summary.totalCalls) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            
            <div className="status-card" style={{ borderLeftColor: getStatusColor('site visit planned') }}>
              <div className="status-header">
                <span className="status-icon">{getStatusIcon('site visit planned')}</span>
                <span className="status-name">Site Visit Planned</span>
              </div>
              <div className="status-count">{statusTotals['site visit planned']}</div>
              <div className="status-percentage">
                {statistics.summary?.totalCalls > 0 
                  ? ((statusTotals['site visit planned'] / statistics.summary.totalCalls) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            
            <div className="status-card" style={{ borderLeftColor: getStatusColor('site visit planned (this week)') }}>
              <div className="status-header">
                <span className="status-icon">{getStatusIcon('site visit planned (this week)')}</span>
                <span className="status-name">Site Visit Planned (This Week)</span>
              </div>
              <div className="status-count">{statusTotals['site visit planned (this week)']}</div>
              <div className="status-percentage">
                {statistics.summary?.totalCalls > 0 
                  ? ((statusTotals['site visit planned (this week)'] / statistics.summary.totalCalls) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            
            <div className="status-card" style={{ borderLeftColor: getStatusColor('Resale-buyer') }}>
              <div className="status-header">
                <span className="status-icon">{getStatusIcon('Resale-buyer')}</span>
                <span className="status-name">Resale Buyer</span>
              </div>
              <div className="status-count">{statusTotals['Resale-buyer']}</div>
              <div className="status-percentage">
                {statistics.summary?.totalCalls > 0 
                  ? ((statusTotals['Resale-buyer'] / statistics.summary.totalCalls) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics by Team Lead */}
        {statistics.userStatistics && statistics.userStatistics.length > 0 && (
          <div className="user-statistics-section">
            <h3>User Call Statistics by Team Lead</h3>
            
            {getSortedTeamLeadNames().map(tlName => {
              const grouped = groupUsersByTeamLead();
              const users = grouped[tlName];
              const userCount = users.length;
              
              return (
                <div key={tlName} className="team-lead-section">
                  <div className="team-lead-header">
                    <h4 className="team-lead-title">
                      <span className="team-lead-icon">👥</span>
                      {tlName}
                      <span className="user-count">({userCount} {userCount === 1 ? 'user' : 'users'})</span>
                    </h4>
                  </div>
                  
                  <div className="table-container">
                    <table className="statistics-table">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Details Shared</th>
                          <th>Warm</th>
                          <th>Site Visit Done</th>
                          <th>Site Visit Planned</th>
                          <th>Site Visit Planned (This Week)</th>
                          <th>Resale Buyer</th>
                          <th>Total Calls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.userId} className="user-row">
                            <td className="user-name-cell">
                              <span className="user-name">{user.fullName}</span>
                            </td>
                            <td className="status-count-cell">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getDisplayCount(user, 'details shared') > 0 ? getStatusColor('details shared') : '#e0e0e0' }}
                              >
                                {getDisplayCount(user, 'details shared')}
                              </span>
                            </td>
                            <td className="status-count-cell">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getDisplayCount(user, 'warm') > 0 ? getStatusColor('warm') : '#e0e0e0' }}
                              >
                                {getDisplayCount(user, 'warm')}
                              </span>
                            </td>
                            <td className="status-count-cell">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getDisplayCount(user, 'site visit done') > 0 ? getStatusColor('site visit done') : '#e0e0e0' }}
                              >
                                {getDisplayCount(user, 'site visit done')}
                              </span>
                            </td>
                            <td className="status-count-cell">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getDisplayCount(user, 'site visit planned') > 0 ? getStatusColor('site visit planned') : '#e0e0e0' }}
                              >
                                {getDisplayCount(user, 'site visit planned')}
                              </span>
                            </td>
                            <td className="status-count-cell">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getDisplayCount(user, 'site visit planned (this week)') > 0 ? getStatusColor('site visit planned (this week)') : '#e0e0e0' }}
                              >
                                {getDisplayCount(user, 'site visit planned (this week)')}
                              </span>
                            </td>
                            <td className="status-count-cell">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getDisplayCount(user, 'Resale-buyer') > 0 ? getStatusColor('Resale-buyer') : '#e0e0e0' }}
                              >
                                {getDisplayCount(user, 'Resale-buyer')}
                              </span>
                            </td>
                            <td className="total-calls-cell">
                              <strong>{user.totalCalls}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallStatusStatistics;
