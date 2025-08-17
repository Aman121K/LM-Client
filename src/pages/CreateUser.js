import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import './CreateUser.css';
import AdminHeaderSection from '../components/AdminHeaderSection';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { userAPI } from '../services/apiService';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    userRole: 'user',
    tlUsername: ''
  });
  const [tlUsers, setTlUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchTlUsers();
  }, []);

  const fetchTlUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/tl`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        console.log("all tl names>>",data.data)
        setTlUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching TL users:', error);
    }
  };

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.userRole) {
      newErrors.userRole = 'User Role is required';
    }

    if (formData.userRole === 'user' && !formData.tlUsername) {
      newErrors.tlUsername = 'Team Lead is required for User role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        navigate('/admin');
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (error) {
      setError('An error occurred while creating the user');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/admin/users');
  };

  const toggleAllUsers = () => {
    if (!showAllUsers) {
      fetchAllUsers();
    }
    setShowAllUsers(!showAllUsers);
  };

  return (
    <>
     <AdminHeaderSection />
  
    <div className="create-user-container">
      
      <div className="create-user-box">
        <div className="header-actions">
          <h1>Create New User</h1>
          <button 
            onClick={toggleAllUsers} 
            className="all-users-btn"
          >
            {showAllUsers ? 'Hide All Users' : 'Show All Users'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        
        {showAllUsers ? (
          <div className="users-table-section">
            {loadingUsers ? (
              <div className="loading">Loading users...</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.userRole}</td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn">Edit</button>
                          <button className="delete-btn">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <Input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="userRole">User Role</label>
              <select
                id="userRole"
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                error={errors.userRole}
                required
              >
                <option value="user">User</option>
                <option value="tl">Team Lead</option>
              </select>
            </div>
            {formData.userRole === 'user' && (
              <div className="form-group">
                <label htmlFor="tlUsername">Team Lead</label>
                <select
                  id="tlUsername"
                  name="tlUsername"
                  value={formData.tlUsername}
                  onChange={handleChange}
                  error={errors.tlUsername}
                  required
                >
                  <option value="">Select Team Lead</option>
                  {tlUsers.map(tl => (
                    <option key={tl.id} value={tl.username}>
                      {tl.FullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-buttons">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Create User
              </Button>
            </div>
          </form>
        )}
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="User Created Successfully"
        size="small"
      >
        <div className="success-message">
          <p>The user has been created successfully and can now log in to the system.</p>
        </div>
        <div className="modal-footer">
          <Button
            variant="primary"
            onClick={handleSuccessClose}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default CreateUser; 