import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AdminHeaderSection from '../components/AdminHeaderSection';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState('all');

  // Static data for demonstration
  const stats = {
    totalUsers: 150,
    activeUsers: 120,
    inactiveUsers: 30
  };

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "active",
      created_at: "2024-03-15"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "active",
      created_at: "2024-03-14"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "User",
      status: "inactive",
      created_at: "2024-03-13"
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "User",
      status: "active",
      created_at: "2024-03-12"
    },
    {
      id: 5,
      name: "David Brown",
      email: "david@example.com",
      role: "User",
      status: "inactive",
      created_at: "2024-03-11"
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  const handleUpload = () => {
    alert('Upload functionality would be implemented here');
  };

  return (
    <div className="admin-dashboard">
      <AdminHeaderSection />

      <div className="admin-content">
        <div className="filters-section">
          <div className="date-filters">
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="date-input"
            />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="date-input"
            />
          </div>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="stats-overview">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p>{stats.activeUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Inactive Users</h3>
            <p>{stats.inactiveUsers}</p>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn">View</button>
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 