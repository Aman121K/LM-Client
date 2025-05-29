import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './Dashboard.css';
import { BASE_URL } from '../config';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    pendingLeads: 0,
    completedLeads: 0
  });

  // Filter states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [callStatus, setCallStatus] = useState('all');
  const [mobileSearch, setMobileSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState('');

  // Fetch leads with filters
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/dashboard/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          callStatus,
          mobileSearch
        })
      });
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [startDate, endDate, callStatus, mobileSearch]);

  const handleReportDownload = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          callStatus,
          reportType: selectedReport
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Lead Management System</h1>
        <div className="header-actions">
          <button onClick={handleReportDownload} className="report-button">
            Download Report
          </button>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Filters Section */}
        <section className="filters-section">
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
              onChange={(e) => setCallStatus(e.target.value)}
              className="status-select"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="no_answer">No Answer</option>
              <option value="busy">Busy</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Mobile Search:</label>
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Enter mobile number"
              className="mobile-search"
            />
          </div>

          <div className="filter-group">
            <label>Report Type:</label>
            <select 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value)}
              className="report-select"
            >
              <option value="">Select Report</option>
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="stats-overview">
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
        </section>

        {/* Leads Table */}
        <section className="leads-table">
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
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.id}</td>
                    <td>{lead.name}</td>
                    <td>{lead.mobile}</td>
                    <td>{lead.email}</td>
                    <td>
                      <span className={`status-badge ${lead.call_status.toLowerCase()}`}>
                        {lead.call_status}
                      </span>
                    </td>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="action-button view">View</button>
                      <button className="action-button edit">Edit</button>
                      <button className="action-button call">Call</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 