import React, { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
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

  const sortedUsers = useMemo(() => {
    if (!sortField) return users;
    
    return [...users].sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || '';
      const bValue = b[sortField]?.toString().toLowerCase() || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [users, sortField, sortDirection]);

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

  const Row = ({ index, style }) => {
    const user = sortedUsers[index];
    const isSelected = selectedUsers.includes(user.id);

    return (
      <div
        className={`table-row ${isSelected ? 'selected' : ''} ${hoveredRow === user.id ? 'hovered' : ''}`}
        style={style}
        onMouseEnter={() => setHoveredRow(user.id)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        <div className="table-cell checkbox-cell">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(user.id)}
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
    );
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-table-container">
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
        <List
          height={600}
          itemCount={sortedUsers.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
};

export default UserTable;
```
