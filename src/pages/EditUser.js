import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import AdminHeaderSection from '../components/AdminHeaderSection';
import { useUserManagement } from '../context/UserManagementContext';
import './EditUser.css';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { teamLeads, updateUser, loading, error, success, clearMessages } = useUserManagement();
  
  const [userData, setUserData] = useState({
    FullName: '',
    Username: '',
    UserEmail: '',
    usertype: '',
    loginstatus: 1,
    tl_name: ''
  });
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const normalizedUserType = data.data.usertype?.toLowerCase() || '';
        const userData = {
          ...data.data,
          usertype: normalizedUserType,
          tl_name: data.data.tl_name || ''
        };
        setUserData(userData);
      } else {
        setLocalError(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      setLocalError('An error occurred while fetching user data');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'usertype' && value !== 'user' && { tl_name: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    if (userData.usertype === 'user' && !userData.tl_name) {
      setLocalError('Please select a Team Lead for the user');
      return;
    }

    try {
      const result = await updateUser(userId, userData);
      if (result) {
        setLocalSuccess('User updated successfully');
        setTimeout(() => {
          navigate('/all-users');
        }, 2000);
      }
    } catch (error) {
      setLocalError(error || 'Failed to update user');
    }
  };

  if (localLoading) {
    return (
      <div className="edit-user-container">
        <AdminHeaderSection />
        <div className="edit-user-content">
          <div className="loading">Loading user data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-user-container">
      <AdminHeaderSection />
      <div className="edit-user-content">
        <h2>Edit User</h2>
        
        {(localError || error) && <div className="error-message">{localError || error}</div>}
        {(localSuccess || success) && <div className="success-message">{localSuccess || success}</div>}

        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="FullName"
              value={userData.FullName}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="Username"
              value={userData.Username}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="UserEmail"
              value={userData.UserEmail}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="form-group">
            <label>User Role</label>
            <select
              name="usertype"
              value={userData.usertype}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="tl">Team Lead</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="form-group">
            <label>Team Lead</label>
            <select
              name="tl_name"
              value={userData.tl_name}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Team Lead</option>
              {teamLeads.map(tl => (
                <option key={tl.id} value={tl.Username}>
                  {tl.FullName} ({tl.Username})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Login Status</label>
            <select
              name="loginstatus"
              value={userData.loginstatus}
              onChange={handleInputChange}
              required
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/all-users')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser; 