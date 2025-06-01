import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import UserHeaderSection from '../components/UserHeaderSection';
import './Dashboard.css';

const Dashboard = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [callStatus, setCallStatus] = useState('all');
  const [mobileSearch, setMobileSearch] = useState('');

  // Static data for demonstration
  const stats = {
    totalLeads: 150,
    activeLeads: 120,
    pendingLeads: 20,
    completedLeads: 10
  };

  const leads = [
    {
      id: 1,
      name: "John Smith",
      mobile: "1234567890",
      email: "john@example.com",
      call_status: "pending",
      created_at: "2024-03-15"
    },
    {
      id: 2,
      name: "Jane Doe",
      mobile: "9876543210",
      email: "jane@example.com",
      call_status: "completed",
      created_at: "2024-03-14"
    },
    {
      id: 3,
      name: "Mike Johnson",
      mobile: "5555555555",
      email: "mike@example.com",
      call_status: "no_answer",
      created_at: "2024-03-13"
    }
  ];

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
            <label>Search Mobile:</label>
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Enter mobile number"
              className="mobile-search"
            />
          </div>
        </div>

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