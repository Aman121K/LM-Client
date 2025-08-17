import React from 'react';
import './VirtualizedUserTable.css';

const VirtualizedUserTable = ({
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
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

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

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="no-data">No users found</div>;
  }

  return (
    <div className="virtualized-table-container">
      <div className="table-header">
        <div className="table-row header-row">
          <div className="table-cell checkbox-cell">
            <input
              type="checkbox"
              checked={selectedUsers.length === users.length && users.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('FullName')}
          >
            Name {getSortIcon('FullName')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('Username')}
          >
            Username {getSortIcon('Username')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('UserEmail')}
          >
            Email {getSortIcon('UserEmail')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('usertype')}
          >
            Role {getSortIcon('usertype')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('tl_name')}
          >
            Team Lead {getSortIcon('tl_name')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('RegDate')}
          >
            Registration Date {getSortIcon('RegDate')}
          </div>
          <div 
            className="table-cell sortable"
            onClick={() => onSort('loginstatus')}
          >
            Login Status {getSortIcon('loginstatus')}
          </div>
          <div className="table-cell">Actions</div>
        </div>
      </div>
      
      <div className="table-body">
        {users.map((user) => (
          <div
            key={user.id}
            className={`table-row ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
          >
            <div className="table-cell checkbox-cell">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => onToggleSelection(user.id)}
              />
            </div>
            <div className="table-cell">{user.FullName || 'N/A'}</div>
            <div className="table-cell">{user.Username || 'N/A'}</div>
            <div className="table-cell">{user.UserEmail || 'N/A'}</div>
            <div className="table-cell">{user.usertype || 'Not Assigned'}</div>
            <div className="table-cell">{user.tl_name || 'Not Assigned'}</div>
            <div className="table-cell">{formatDate(user.RegDate)}</div>
            <div className="table-cell">
              <span className={`status-badge ${getStatusBadge(user.loginstatus)}`}>
                {user.loginstatus === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="table-cell actions-cell">
              <button className="edit-btn" onClick={() => onEdit(user.id)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => onDelete(user.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedUserTable;
