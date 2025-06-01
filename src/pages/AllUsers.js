import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import AdminHeaderSection from '../components/AdminHeaderSection';
import './AllUsers.css';
import { useNavigate } from 'react-router-dom';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);

  // Column filter states
  const [columnFilters, setColumnFilters] = useState({
    FullName: null,
    Username: null,
    UserEmail: null,
    usertype: null,
    tl_name: null,
    loginstatus: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/allUserList?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          fetchUsers();
        } else {
          setError(data.message || 'Failed to delete user');
        }
      } catch (error) {
        setError('An error occurred while deleting the user');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (loginStatus) => {
    return loginStatus === 1 ? 'active' : 'inactive';
  };

  const handleColumnFilter = (column) => {
    setColumnFilters(prev => {
      const currentFilter = prev[column];
      let newFilter;

      switch (column) {
        case 'loginstatus':
          if (currentFilter === null) newFilter = 1;
          else if (currentFilter === 1) newFilter = 0;
          else newFilter = null;
          break;
        case 'usertype':
          if (currentFilter === null) newFilter = 'admin';
          else if (currentFilter === 'admin') newFilter = 'tl';
          else if (currentFilter === 'tl') newFilter = 'user';
          else newFilter = null;
          break;
        default:
          newFilter = currentFilter === 'asc' ? 'desc' : 'asc';
      }

      return {
        ...prev,
        [column]: newFilter
      };
    });
  };

  const getFilterIcon = (column) => {
    const filter = columnFilters[column];
    if (filter === null) return '↕️';
    if (column === 'loginstatus') {
      return filter === 1 ? '🟢' : '🔴';
    }
    if (column === 'usertype') {
      return filter === 'admin' ? '👑' : filter === 'tl' ? '👥' : '👤';
    }
    return filter === 'asc' ? '↑' : '↓';
  };

  const filteredUsers = users.filter(user => {
    // Search term filter
    const matchesSearch = 
      user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.UserEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Column filters
    const matchesFilters = Object.entries(columnFilters).every(([column, filter]) => {
      if (filter === null) return true;
      
      switch (column) {
        case 'loginstatus':
          return user[column] === filter;
        case 'usertype':
          return user[column] === filter;
        case 'FullName':
        case 'Username':
        case 'UserEmail':
        case 'tl_name':
          if (filter === 'asc') {
            return true; // Will be sorted later
          }
          return true;
        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  }).sort((a, b) => {
    // Apply sorting
    for (const [column, filter] of Object.entries(columnFilters)) {
      if (filter === 'asc' || filter === 'desc') {
        const aValue = a[column]?.toLowerCase() || '';
        const bValue = b[column]?.toLowerCase() || '';
        if (aValue !== bValue) {
          return filter === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      }
    }
    return 0;
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Next
      </button>
    );

    return pages;
  };

  return (
    <div className="all-users-container">
      <AdminHeaderSection />
      
      <div className="all-users-content">
        <div className="filters-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="role-filter">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="tl">Team Lead</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th onClick={() => handleColumnFilter('FullName')} className="sortable">
                      Name {getFilterIcon('FullName')}
                    </th>
                    <th onClick={() => handleColumnFilter('Username')} className="sortable">
                      Username {getFilterIcon('Username')}
                    </th>
                    <th onClick={() => handleColumnFilter('UserEmail')} className="sortable">
                      Email {getFilterIcon('UserEmail')}
                    </th>
                    <th onClick={() => handleColumnFilter('usertype')} className="sortable">
                      Role {getFilterIcon('usertype')}
                    </th>
                    <th onClick={() => handleColumnFilter('tl_name')} className="sortable">
                      Team Lead {getFilterIcon('tl_name')}
                    </th>
                    <th>Registration Date</th>
                    <th onClick={() => handleColumnFilter('loginstatus')} className="sortable">
                      Login Status {getFilterIcon('loginstatus')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.FullName}</td>
                      <td>{user.Username}</td>
                      <td>{user.UserEmail}</td>
                      <td>{user.usertype || 'Not Assigned'}</td>
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
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pagination-container">
              {renderPagination()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllUsers; 