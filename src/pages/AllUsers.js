import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeaderSection from '../components/AdminHeaderSection';
import MobileDashboardLayout from '../components/MobileDashboardLayout';
import UserTable from '../components/UserTable';
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
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

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

  const handleToggleSelection = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [filteredUsers]);

  const handleEdit = useCallback((userId) => {
    navigate(`/edit-user/${userId}`);
  }, [navigate]);

  const handleDelete = useCallback((userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Handle delete
      console.log('Delete user:', userId);
    }
  }, []);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const handleBulkEdit = useCallback(() => {
    if (selectedUsers.length === 0) return;
    // Handle bulk edit
    console.log('Bulk edit users:', selectedUsers);
  }, [selectedUsers]);

  const handleBulkDelete = useCallback(() => {
    if (selectedUsers.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      // Handle bulk delete
      console.log('Bulk delete users:', selectedUsers);
      setSelectedUsers([]);
    }
  }, [selectedUsers]);

  // Dashboard actions
  const dashboardActions = [
    {
      label: 'Add New User',
      icon: '👤',
      variant: 'btn-primary',
      onClick: () => navigate('/create-user'),
    },
    {
      label: 'Export Users',
      icon: '📤',
      variant: 'btn-outline',
      onClick: () => console.log('Export users'),
    },
    {
      label: 'Bulk Edit',
      icon: '✏️',
      variant: 'btn-outline',
      onClick: handleBulkEdit,
      disabled: selectedUsers.length === 0,
    },
    {
      label: 'Bulk Delete',
      icon: '🗑️',
      variant: 'btn-danger',
      onClick: handleBulkDelete,
      disabled: selectedUsers.length === 0,
    },
  ];

  // Dashboard filters
  const dashboardFilters = [
    {
      type: 'select',
      value: filters?.role || '',
      onChange: (e) => setFilters(prev => ({ ...prev, role: e.target.value })),
      options: [
        { value: '', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'operator', label: 'Operator' },
        { value: 'team_lead', label: 'Team Lead' },
      ],
    },
    {
      type: 'select',
      value: filters?.status || '',
      onChange: (e) => setFilters(prev => ({ ...prev, status: e.target.value })),
      options: [
        { value: '', label: 'All Status' },
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' },
      ],
    },
    {
      type: 'text',
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      placeholder: 'Search users...',
    },
  ];

  // Dashboard stats
  const dashboardStats = [
    {
      icon: '👥',
      value: users?.length || 0,
      label: 'Total Users',
    },
    {
      icon: '✅',
      value: users?.filter(user => user.loginstatus === 1).length || 0,
      label: 'Active Users',
    },
    {
      icon: '❌',
      value: users?.filter(user => user.loginstatus === 0).length || 0,
      label: 'Inactive Users',
    },
    {
      icon: '🎯',
      value: selectedUsers.length,
      label: 'Selected',
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="all-users-container">
        <AdminHeaderSection />
        <MobileDashboardLayout
          title="User Management"
          subtitle="Manage all system users"
        >
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading users...</p>
          </div>
        </MobileDashboardLayout>
      </div>
    );
  }

  return (
    <div className="all-users-container">
      <AdminHeaderSection />
      
      <MobileDashboardLayout
        title="User Management"
        subtitle="Manage all system users"
        actions={dashboardActions}
        filters={dashboardFilters}
        stats={dashboardStats}
      >
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h3 className="error-title">Error Loading Users</h3>
              <p className="error-description">{error}</p>
            </div>
          </div>
        )}

        <UserTable
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          loading={loading}
        />

        {/* Mobile Summary */}
        <div className="mobile-summary-section hidden-desktop">
          <div className="summary-card">
            <div className="summary-header">
              <h3 className="summary-title">Summary</h3>
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Total Users:</span>
                <span className="summary-value">{users?.length || 0}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Filtered Results:</span>
                <span className="summary-value">{filteredUsers.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Selected:</span>
                <span className="summary-value">{selectedUsers.length}</span>
              </div>
              {searchTerm && (
                <div className="summary-item">
                  <span className="summary-label">Search Term:</span>
                  <span className="summary-value">"{searchTerm}"</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </MobileDashboardLayout>
    </div>
  );
};

export default AllUsers; 