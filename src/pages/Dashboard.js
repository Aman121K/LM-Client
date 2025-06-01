import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import UserHeaderSection from '../components/UserHeaderSection';
import { BASE_URL } from '../config';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [callStatus, setCallStatus] = useState('Call Back Later');
  const [mobileSearch, setMobileSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [callStatuses, setCallStatuses] = useState([]);
  const [loginUserCallStatus, setLoginUserCallStatus] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    pendingLeads: 0,
    completedLeads: 0
  });

  useEffect(() => {
    fetchCallStatuses();
    fetchLoginUserCallStatus();
  }, [startDate, endDate, callStatus, mobileSearch, user]);

  const fetchCallStatuses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads/allCallStatus`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCallStatuses(data?.data);
      } else {
        setError(data.message || 'Failed to fetch call statuses');
      }
    } catch (error) {
      setError('An error occurred while fetching call statuses');
    }
  };

  const fetchLoginUserCallStatus = async () => {
    if (!user) return; // Don't fetch if user is not available

    try {
      setLoading(true);
      console.log("user>>>>>>>>", user);
      const params = new URLSearchParams({
        // startDate: startDate.toISOString().split('T')[0],
        // endDate: endDate.toISOString().split('T')[0],
        // callStatus: callStatus,
        callby: user
      });

      const response = await fetch(`${BASE_URL}/leads/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setLoginUserCallStatus(data.data || []);
        setStats({
          totalLeads: data.data.totalLeads || 0,
          activeLeads: data.data.activeLeads || 0,
          pendingLeads: data.data.pendingLeads || 0,
          completedLeads: data.data.completedLeads || 0
        });
      } else {
        setError(data.message || 'Failed to fetch call status data');
      }
    } catch (error) {
      setError('An error occurred while fetching call status data');
    } finally {
      setLoading(false);
    }
  };

  const handleCallStatusChange = (e) => {
    const selectedStatus = e.target.value;
    setCallStatus(selectedStatus);
  };

  const handleCallClick = (phoneNumber) => {
    // Remove any non-numeric characters and ensure it starts with 91
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    window.location.href = `tel:${formattedNumber}`;
  };

  const handleMobileSearch = (e) => {
    setMobileSearch(e.target.value);
  };

  const filteredLeads = loginUserCallStatus.filter(lead => {
    if (!mobileSearch) return true;
    const searchTerm = mobileSearch.toLowerCase();
    const phoneNumber = lead.ContactNumber?.toLowerCase() || '';
    return phoneNumber.includes(searchTerm);
  });

  return (
    <div className="dashboard-container">
      <UserHeaderSection />

      <main className="dashboard-content">
        <div className="filters-section">
          <div className="filter-group">
            <label>Date Range:</label>
            <div className="date-range">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="date-picker"
              />
              <span>to</span>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="date-picker"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Call Status:</label>
            <select
              value={callStatus}
              onChange={handleCallStatusChange}
              className="status-select"
            >
              <option value="all">All</option>
              {callStatuses?.map((status, index) => (
                <option key={index} value={status?.id}>
                  {status?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Search Mobile:</label>
            <input
              type="text"
              value={mobileSearch}
              onChange={handleMobileSearch}
              placeholder="Enter mobile number"
              className="mobile-search"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="stats-overview">
          <div className="stat-card">
            <h3>Total Leads</h3>
            <p className="stat-number">{stats.totalLeads}</p>
          </div>
          <div className="stat-card">
            <h3>Active Leads</h3>
            <p className="stat-number">{stats.activeLeads}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Leads</h3>
            <p className="stat-number">{stats.pendingLeads}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Leads</h3>
            <p className="stat-number">{stats.completedLeads}</p>
          </div>
        </div>

        <section className="leads-table">
          {loading ? (
            <div className="loading">Loading leads data...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Call Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>{lead.id}</td>
                      <td>{lead.FirstName}</td>
                      <td>{lead.ContactNumber}</td>
                      <td>{lead.email}</td>
                      <td>
                        <span className={`status-badge ${lead?.callstatus.toLowerCase()}`}>
                          {lead.call_status}
                        </span>
                      </td>
                      <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="action-button view">View</button>
                        <button className="action-button edit">Edit</button>
                        <button 
                          className="action-button call"
                          onClick={() => handleCallClick(lead.ContactNumber)}
                        >
                          Call
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 