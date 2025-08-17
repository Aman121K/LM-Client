import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeaderSection from '../components/AdminHeaderSection';
import AutoCompleteSearch from '../components/AutoCompleteSearch';
import { useUserManagement } from '../hooks/useUserManagement';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import './AllUsers.css';

const AllUsers = () => {
  const navigate = useNavigate();
  const { logPerformance } = usePerformanceMonitor('AllUsers');
  
  const {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    setFilters,
  } = useUserManagement();

  // Local search state
  const [searchTerm, setSearchTerm] = useState('');

  // Add debugging
  useEffect(() => {
    console.log('Users data:', users);
    console.log('Pagination data:', pagination);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
  }, [users, pagination, loading, error]);

  // Single useEffect for initial data fetch
  useEffect(() => {
    console.log('Starting to fetch users...');
    fetchUsers();
  }, []);

  // Local search functionality
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase().trim();
    
    return users.filter(user => 
      (user.FullName && user.FullName.toLowerCase().includes(term)) ||
      (user.Username && user.Username.toLowerCase().includes(term)) ||
      (user.UserEmail && user.UserEmail.toLowerCase().includes(term)) ||
      (user.usertype && user.usertype.toLowerCase().includes(term)) ||
      (user.tl_name && user.tl_name.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  const handleSearch = useCallback((searchTerm) => {
    setSearchTerm(searchTerm);
  }, []);

  const getStatusBadge = (loginStatus) => {
    return loginStatus === 1 ? 'active' : 'inactive';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="all-users-container">
        <AdminHeaderSection />
        <div className="all-users-content">
          <div className="page-header">
            <div className="header-left">
              <h2>User Management</h2>
            </div>
          </div>
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-users-container">
      <AdminHeaderSection />
      
      <div className="all-users-content">
        <div className="page-header">
          <div className="header-left">
            <h2>User Management</h2>
          </div>
          <button 
            className="add-user-btn"
            onClick={() => navigate('/create-user')}
          >
            Add New User
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="search-section">
          <AutoCompleteSearch
            value={searchTerm}
            onChange={handleSearch}
            onSearch={handleSearch}
            placeholder="Search by name, email, username, role, or team lead..."
            suggestions={[]} // Empty array to prevent suggestions dropdown
            loading={false}
          />
        </div>

        {/* Simple Table View */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team Lead</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="user-row">
                    <td>{user.id}</td>
                    <td>{user.FullName || 'N/A'}</td>
                    <td>{user.Username || 'N/A'}</td>
                    <td>{user.UserEmail || 'N/A'}</td>
                    <td>
                      <span className={`role-badge ${user.usertype?.toLowerCase()}`}>
                        {user.usertype || 'Not Assigned'}
                      </span>
                    </td>
                    <td>{user.tl_name || 'Not Assigned'}</td>
                    <td>{formatDate(user.RegDate)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(user.loginstatus)}`}>
                        {user.loginstatus === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => navigate(`/edit-user/${user.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user?')) {
                              // Handle delete
                              console.log('Delete user:', user.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="table-summary">
          <p>
            Showing {filteredUsers.length} of {users ? users.length : 0} users
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllUsers; 