import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import AdminHeaderSection from '../components/AdminHeaderSection';
import './EditUser.css';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState({
    FullName: '',
    Username: '',
    UserEmail: '',
    usertype: '',
    loginstatus: 1,
    tl_name: ''
  });
  const [teamLeads, setTeamLeads] = useState([]);
  const [usersUnderTL, setUsersUnderTL] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchTeamLeads();
  }, [userId]);

  useEffect(() => {
    if (userData.usertype === 'tl') {
      // fetchUsersUnderTL();
    }
  }, [userData.usertype]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log("API Response:", data); // Debug log
      
      if (data.success) {
        // Normalize the usertype to match the select options
        const normalizedUserType = data.data.usertype?.toLowerCase() || '';
        const userData = {
          ...data.data,
          usertype: normalizedUserType,
          tl_name: data.data.tl_name || ''
        };
        console.log("Normalized user data:", userData);
        setUserData(userData);
      } else {
        setError(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      setError('An error occurred while fetching user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamLeads = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/tl`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log("Team Leads Response:", data); // Debug log
      
      if (data.success) {
        // Filter out the current user from team leads list
        const filteredTLs = data.data.filter(tl => tl.id !== parseInt(userId));
        console.log("Filtered Team Leads:", filteredTLs); // Debug log
        setTeamLeads(filteredTLs);
      }
    } catch (error) {
      console.error('Error fetching team leads:', error);
    }
  };

  const fetchUsersUnderTL = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/under-tl/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsersUnderTL(data.data);
      }
    } catch (error) {
      console.error('Error fetching users under TL:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
      // Clear TL assignment if role is changed to admin or TL
      ...(name === 'usertype' && value !== 'user' && { tl_name: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate TL assignment
    if (userData.usertype === 'user' && !userData.tl_name) {
      setError('Please select a Team Lead for the user');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('User updated successfully');
        setTimeout(() => {
          navigate('/all-users');
        }, 2000);
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (error) {
      setError('An error occurred while updating user');
    }
  };

  if (loading) {
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
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
            <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Current TL: {userData.tl_name}
            </div>
          </div>

          {userData.usertype === 'tl' && usersUnderTL.length > 0 && (
            <div className="form-group">
              <label>Users Under This Team Lead</label>
              <div className="users-under-tl">
                {usersUnderTL.map(user => (
                  <div key={user.id} className="user-item">
                    <span>{user.FullName}</span>
                    <span className="user-email">({user.UserEmail})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <button type="submit" className="save-btn">
              Save Changes
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