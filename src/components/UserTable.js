import React, { useState, useMemo } from 'react';
import MobileSearch from './MobileSearch';
import './UserTable.css';

const UserTable = ({
  users,
  selectedUsers,
  onToggleSelection,
  onSelectAll,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
  loading
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.FullName?.toLowerCase().includes(query) ||
      user.Username?.toLowerCase().includes(query) ||
      user.UserEmail?.toLowerCase().includes(query) ||
      user.usertype?.toLowerCase().includes(query) ||
      user.tl_name?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const sortedUsers = useMemo(() => {
    if (!sortField) return filteredUsers;
    
    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || '';
      const bValue = b[sortField]?.toString().toLowerCase() || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [filteredUsers, sortField, sortDirection]);

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusBadge = (loginStatus) => {
    return loginStatus === 1 ? 'active' : 'inactive';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const MobileUserCard = ({ user, isSelected }) => (
    <div className={`mobile-user-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-header-row">
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(user.id)}
            className="mobile-checkbox"
            aria-label={`Select ${user.FullName}`}
          />
        </div>
        <div className="user-name-section">
          <h3 className="user-full-name">{user.FullName}</h3>
          <p className="user-username">@{user.Username}</p>
        </div>
        <div className="status-badge-wrapper">
          <span className={`status-badge ${getStatusBadge(user.loginstatus)}`}>
            {user.loginstatus === 1 ? '✅ Active' : '❌ Inactive'}
          </span>
        </div>
      </div>
      
      <div className="card-body-row">
        <div className="info-item">
          <label className="info-label">📧 Email:</label>
          <span className="info-value">{user.UserEmail}</span>
        </div>
        <div className="info-item">
          <label className="info-label">👤 Role:</label>
          <span className="info-value">{user.usertype || 'Not Assigned'}</span>
        </div>
        <div className="info-item">
          <label className="info-label">👥 Team Lead:</label>
          <span className="info-value">{user.tl_name || 'Not Assigned'}</span>
        </div>
        <div className="info-item">
          <label className="info-label">📅 Registered:</label>
          <span className="info-value">{formatDate(user.RegDate)}</span>
        </div>
      </div>
      
      <div className="card-actions-row">
        <button 
          className="btn btn-outline btn-sm action-btn edit-action"
          onClick={() => onEdit(user.id)}
          aria-label={`Edit ${user.FullName}`}
        >
          ✏️ Edit
        </button>
        <button 
          className="btn btn-danger btn-sm action-btn delete-action"
          onClick={() => onDelete(user.id)}
          aria-label={`Delete ${user.FullName}`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  const DesktopTableRow = ({ user, isSelected }) => (
    <div
      className={`table-row ${isSelected ? 'selected' : ''} ${hoveredRow === user.id ? 'hovered' : ''}`}
      onMouseEnter={() => setHoveredRow(user.id)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <div className="table-cell checkbox-cell">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(user.id)}
          aria-label={`Select ${user.FullName}`}
        />
      </div>
      <div className="table-cell">{user.FullName}</div>
      <div className="table-cell">{user.Username}</div>
      <div className="table-cell">{user.UserEmail}</div>
      <div className="table-cell">{user.usertype || 'Not Assigned'}</div>
      <div className="table-cell">{user.tl_name || 'Not Assigned'}</div>
      <div className="table-cell">{formatDate(user.RegDate)}</div>
      <div className="table-cell">
        <span className={`status-badge ${getStatusBadge(user.loginstatus)}`}>
          {user.loginstatus === 1 ? '✅ Active' : '❌ Inactive'}
        </span>
      </div>
      <div className="table-cell actions-cell">
        <button className="btn btn-outline btn-sm" onClick={() => onEdit(user.id)}>
          ✏️ Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(user.id)}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading users...</p>
        <div className="loading-skeleton-container">
          {[1, 2, 3].map(i => (
            <div key={i} className="loading-skeleton-card">
              <div className="loading-skeleton loading-skeleton-title"></div>
              <div className="loading-skeleton loading-skeleton-text"></div>
              <div className="loading-skeleton loading-skeleton-text"></div>
              <div className="loading-skeleton loading-skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3 className="empty-title">No Users Found</h3>
        <p className="empty-description">There are no users to display at the moment.</p>
        <div className="empty-actions">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-table-container">
      {/* Mobile Header with Enhanced Search */}
      <div className="mobile-header-section hidden-desktop">
        <MobileSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Search users by name, email, role, or team lead..."
          suggestions={[]}
          loading={loading}
          showSuggestions={false}
          minSearchLength={2}
        />
        
        <div className="mobile-controls">
          <button 
            className="btn btn-outline btn-sm filter-toggle"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            aria-label={showMobileFilters ? 'Hide filters' : 'Show filters'}
          >
            {showMobileFilters ? '🔽 Hide' : '🔼 Show'} Filters
          </button>
          <button 
            className="btn btn-outline btn-sm action-toggle"
            onClick={() => setShowMobileActions(!showMobileActions)}
            aria-label={showMobileActions ? 'Hide actions' : 'Show actions'}
          >
            {showMobileActions ? '🔽 Hide' : '🔼 Show'} Actions
          </button>
          <button 
            className="btn btn-primary btn-sm select-all-btn"
            onClick={() => onSelectAll(true)}
            aria-label="Select all users"
          >
            ✅ Select All
          </button>
        </div>
        
        {/* Collapsible Filters */}
        {showMobileFilters && (
          <div className="collapsible-filters">
            <div className="filters-grid">
              <button 
                className={`filter-chip ${sortField === 'FullName' ? 'active' : ''}`}
                onClick={() => onSort('FullName')}
                aria-label="Sort by name"
              >
                👤 Name {getSortIcon('FullName')}
              </button>
              <button 
                className={`filter-chip ${sortField === 'usertype' ? 'active' : ''}`}
                onClick={() => onSort('usertype')}
                aria-label="Sort by role"
              >
                🎭 Role {getSortIcon('usertype')}
              </button>
              <button 
                className={`filter-chip ${sortField === 'loginstatus' ? 'active' : ''}`}
                onClick={() => onSort('loginstatus')}
                aria-label="Sort by status"
              >
                📊 Status {getSortIcon('loginstatus')}
              </button>
              <button 
                className={`filter-chip ${sortField === 'RegDate' ? 'active' : ''}`}
                onClick={() => onSort('RegDate')}
                aria-label="Sort by registration date"
              >
                📅 Date {getSortIcon('RegDate')}
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Actions */}
        {showMobileActions && (
          <div className="collapsible-actions">
            <div className="actions-grid">
              <button className="btn btn-success btn-sm bulk-action">
                📤 Export Selected ({selectedUsers.length})
              </button>
              <button className="btn btn-warning btn-sm bulk-action">
                📧 Email Selected ({selectedUsers.length})
              </button>
              <button className="btn btn-info btn-sm bulk-action">
                📊 Generate Report
              </button>
            </div>
          </div>
        )}

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="search-results-summary">
            <span className="search-results-text">
              🔍 Showing {sortedUsers.length} of {users.length} users for "{searchQuery}"
            </span>
            {searchQuery && (
              <button 
                className="btn btn-outline btn-sm clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕ Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table Header */}
      <div className="table-header hidden-mobile">
        <div className="table-row header-row">
          <div className="table-cell checkbox-cell">
            <input
              type="checkbox"
              checked={selectedUsers.length === users.length && users.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
              aria-label="Select all users"
            />
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('FullName')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSort('FullName')}
            aria-label="Sort by name"
          >
            👤 Name {getSortIcon('FullName')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('Username')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSort('Username')}
            aria-label="Sort by username"
          >
            🆔 Username {getSortIcon('Username')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('UserEmail')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSort('UserEmail')}
            aria-label="Sort by email"
          >
            📧 Email {getSortIcon('UserEmail')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('usertype')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSort('usertype')}
            aria-label="Sort by role"
          >
            🎭 Role {getSortIcon('usertype')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('tl_name')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSort('tl_name')}
            aria-label="Sort by team lead"
          >
            👥 Team Lead {getSortIcon('tl_name')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('RegDate')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSort('RegDate')}
            aria-label="Sort by registration date"
          >
            📅 Registration Date {getSortIcon('RegDate')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('loginstatus')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSort('loginstatus')}
            aria-label="Sort by login status"
          >
            📊 Login Status {getSortIcon('loginstatus')}
          </div>
          <div className="table-cell">🎯 Actions</div>
        </div>
      </div>
      
      {/* Mobile User Cards */}
      <div className="mobile-users-container hidden-desktop">
        {sortedUsers.map(user => (
          <MobileUserCard 
            key={user.id} 
            user={user} 
            isSelected={selectedUsers.includes(user.id)}
          />
        ))}
      </div>
      
      {/* Desktop Table Body */}
      <div className="table-body hidden-mobile">
        {sortedUsers.map(user => (
          <DesktopTableRow 
            key={user.id} 
            user={user} 
            isSelected={selectedUsers.includes(user.id)}
          />
        ))}
      </div>
      
      {/* Mobile Summary */}
      <div className="mobile-summary hidden-desktop">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Selected</span>
            <span className="stat-value">{selectedUsers.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-label">Active</span>
            <span className="stat-value">{users.filter(u => u.loginstatus === 1).length}</span>
          </div>
          {searchQuery && (
            <div className="stat-item">
              <span className="stat-icon">🔍</span>
              <span className="stat-label">Filtered</span>
              <span className="stat-value">{sortedUsers.length}</span>
            </div>
          )}
        </div>
        
        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <button className="btn btn-outline btn-sm bulk-action">
              ✏️ Edit Selected ({selectedUsers.length})
            </button>
            <button className="btn btn-danger btn-sm bulk-action">
              🗑️ Delete Selected ({selectedUsers.length})
            </button>
            <button className="btn btn-success btn-sm bulk-action">
              📤 Export Selected
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions Floating Button */}
      <div className="floating-actions hidden-desktop">
        <button 
          className="floating-action-btn primary"
          onClick={() => setShowMobileActions(!showMobileActions)}
          aria-label="Quick actions"
        >
          ⚡
        </button>
        {selectedUsers.length > 0 && (
          <div className="floating-badge">
            {selectedUsers.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
