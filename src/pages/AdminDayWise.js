import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AdminHeaderSection from '../components/AdminHeaderSection';
import './AdminDayWise.css';
import { BASE_URL } from '../config';

const AdminDayWise = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTLs, setTotalTLs] = useState(0);

  const fetchDayWiseReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await fetch(`${BASE_URL}/leads/daily-call-completion-by-tl?startDate=${startDateStr}&endDate=${endDateStr}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch day-wise report');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data || []);
        
        // Calculate totals
        let totalCallsCount = 0;
        let uniqueUsers = new Set();
        let uniqueTLs = new Set();
        
        data.data.forEach(dateData => {
          dateData.tls.forEach(tl => {
            uniqueTLs.add(tl.tlUsername);
            tl.users.forEach(user => {
              uniqueUsers.add(user.userUsername);
              totalCallsCount += user.callCount;
            });
          });
        });
        
        setTotalCalls(totalCallsCount);
        setTotalUsers(uniqueUsers.size);
        setTotalTLs(uniqueTLs.size);
      } else {
        throw new Error(data.message || 'Failed to fetch report');
      }
    } catch (err) {
      setError(err.message || 'Error fetching day-wise report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayWiseReport();
  }, []);

  const handleDateRangeSubmit = (e) => {
    e.preventDefault();
    fetchDayWiseReport();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-daywise">
      <AdminHeaderSection />
      <main className="admin-content">
        <div className="page-header">
          <h1 className="page-title">Day Wise Report</h1>
          <p className="page-subtitle">Track daily call performance by team leads and users</p>
        </div>

        {/* Date Range Selector */}
        <div className="date-range-section">
          <form onSubmit={handleDateRangeSubmit} className="date-range-form">
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="startDate">Start Date</label>
                <DatePicker
                  id="startDate"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  className="date-picker"
                  dateFormat="MMM dd, yyyy"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="endDate">End Date</label>
                <DatePicker
                  id="endDate"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  className="date-picker"
                  dateFormat="MMM dd, yyyy"
                />
              </div>
            </div>
            <button type="submit" className="fetch-btn" disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Report'}
            </button>
          </form>
        </div>

        {/* Summary Cards */}
        {!loading && reportData.length > 0 && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">📅</div>
              <div className="summary-content">
                <h3>{reportData.length}</h3>
                <p>Days</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div className="summary-content">
                <h3>{totalTLs}</h3>
                <p>Team Leads</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">👤</div>
              <div className="summary-content">
                <h3>{totalUsers}</h3>
                <p>Users</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📞</div>
              <div className="summary-content">
                <h3>{totalCalls}</h3>
                <p>Total Calls</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="modern-loader" aria-busy="true" aria-label="Loading">
            <div className="spinner"></div>
            <span>Loading day-wise report...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-message">
            <span role="img" aria-label="Error">��</span>
            <div style={{marginTop: '0.5rem'}}>Something went wrong.<br/>{error}</div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && reportData.length === 0 && (
          <div className="no-data">
            <span role="img" aria-label="No data" style={{fontSize: '2.5rem'}}>��</span>
            <div style={{marginTop: '1rem', fontWeight: 500}}>No data available for selected date range.</div>
            <div style={{color: '#aaa', fontSize: '1rem', marginTop: '0.5rem'}}>Try selecting a different date range.</div>
          </div>
        )}

        {/* Report Data */}
        {!loading && !error && reportData.length > 0 && (
          <div className="report-container">
            {reportData.map((dateData, dateIndex) => (
              <div key={dateIndex} className="date-section">
                <div className="date-header">
                  <h2 className="date-title">{formatDate(dateData.date)}</h2>
                  <div className="date-summary">
                    <span className="tl-count">{dateData.tls.length} Team Lead{dateData.tls.length !== 1 ? 's' : ''}</span>
                    <span className="user-count">
                      {dateData.tls.reduce((total, tl) => total + tl.users.length, 0)} User{dateData.tls.reduce((total, tl) => total + tl.users.length, 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="tl-cards">
                  {dateData.tls.map((tl, tlIndex) => (
                    <div key={tlIndex} className="tl-card">
                      <div className="tl-card-header">
                        <div className="tl-info">
                          <span className="tl-avatar">👤</span>
                          <div className="tl-details">
                            <h3 className="tl-name">{tl.tlName}</h3>
                            <span className="tl-username">@{tl.tlUsername}</span>
                          </div>
                        </div>
                        <div className="tl-summary">
                          <span className="user-count">{tl.users.length} User{tl.users.length !== 1 ? 's' : ''}</span>
                          <span className="total-calls">
                            {tl.users.reduce((total, user) => total + user.callCount, 0)} Calls
                          </span>
                        </div>
                      </div>

                      <div className="users-table-container">
                        <table className="users-table">
                          <thead>
                            <tr>
                              <th>User Name</th>
                              <th>Username</th>
                              <th>Call Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tl.users.map((user, userIndex) => (
                              <tr key={userIndex}>
                                <td className="user-name">{user.userName}</td>
                                <td className="user-username">@{user.userUsername}</td>
                                <td className="call-count">
                                  <span className="call-badge">{user.callCount}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDayWise;
