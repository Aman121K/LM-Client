import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/apiService';
import AdminHeaderSection from '../components/AdminHeaderSection';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Pagination from '../components/Pagination';
import './AllUsers.css';

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Column filter states
  const [columnFilters, setColumnFilters] = useState({
    FullName: null,
    Username: null,
    UserEmail: null,
    usertype: null,
    tl_name: null,
    loginstatus: null
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: selectedRole !== 'all' ? selectedRole : undefined
      });
      
      setUsers(response.data.users);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUser(userToDelete);
      await userAPI.deleteUser(userToDelete);
      
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      setError('Failed to delete user. Please try again.');
      console.error('Error deleting user:', error);
    } finally {
      setDeletingUser(null);
    }
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
        default:
          if (currentFilter === null) newFilter = 'asc';
          else if (currentFilter === 'asc') newFilter = 'desc';
          else newFilter = null;
      }

      return { ...prev, [column]: newFilter };
    });
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.UserEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.usertype === selectedRole);
    }

    return filtered;
  }, [users, searchTerm, selectedRole]);

  const tableColumns = [
    {
      key: 'FullName',
      label: 'Full Name',
      sortable: true,
      render: (value, user) => (
        <div className="user-name">
          <div className="user-avatar">
            {user.FullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-full-name">{value}</div>
            <div className="user-username">@{user.Username}</div>
          </div>
        </div>
      )
    },
    {
      key: 'UserEmail',
      label: 'Email',
      sortable: true,
      render: (value) => (
        <a href={`mailto:${value}`} className="user-email">
          {value}
        </a>
      )
    },
    {
      key: 'usertype',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <span className={`role-badge role-${value}`}>
          {value === 'admin' ? 'Admin' : 
           value === 'tl' ? 'Team Lead' : 'User'}
        </span>
      )
    },
    {
      key: 'tl_name',
      label: 'Team Lead',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'loginstatus',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`status-badge status-${value === 1 ? 'active' : 'inactive'}`}>
          {value === 1 ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <div className="action-buttons">
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate(`/edit-user/${user.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleDelete(user.id)}
            disabled={deletingUser === user.id}
            loading={deletingUser === user.id}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="all-users-container">
      <AdminHeaderSection />
      
      <div className="all-users-content">
        <div className="page-header">
          <div className="page-title">
            <h1>All Users</h1>
            <p>Manage system users and their permissions</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/create-user')}
          >
            Create User
          </Button>
        </div>

        <div className="filters-section">
          <div className="search-filter">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              icon="🔍"
            />
          </div>
          <div className="role-filter">
            <select
              value={selectedRole}
              onChange={handleRoleFilter}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="tl">Team Lead</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton type="table" rows={10} />
        ) : (
          <>
            <Table
              columns={tableColumns}
              data={filteredUsers}
              emptyMessage="No users found"
              onSort={handleColumnFilter}
              sortConfig={columnFilters}
            />

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="small"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            loading={deletingUser}
          >
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AllUsers; 