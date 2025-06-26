import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import './CreateUser.css';
import AdminHeaderSection from '../components/AdminHeaderSection';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/create`, {
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
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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
                  required
                >
                  <option value="">Select Team Lead</option>
                  {tlUsers.map(tl => (
                    <option key={tl.id} value={tl.username}>
                      {tl.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" onClick={() => navigate('/admin')} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  );
};

export default CreateUser; 