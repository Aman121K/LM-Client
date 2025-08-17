import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/apiService';
import AdminHeaderSection from '../components/AdminHeaderSection';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './EditUser.css';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    role: 'user',
    status: 1
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserById(id);
      const userData = response.data.user;
      
      setUser(userData);
      setFormData({
        firstName: userData.firstName || userData.FullName?.split(' ')[0] || '',
        lastName: userData.lastName || userData.FullName?.split(' ').slice(1).join(' ') || '',
        email: userData.email || userData.UserEmail || '',
        username: userData.username || userData.Username || '',
        phone: userData.phone || userData.Phone || '',
        role: userData.role || userData.usertype || 'user',
        status: userData.status !== undefined ? userData.status : (userData.loginstatus || 1)
      });
    } catch (error) {
      setError('Failed to fetch user details');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');
      
      await userAPI.updateUser(id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        phone: formData.phone,
        role: formData.role,
        status: formData.status
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/users');
  };

  if (loading) {
    return (
      <div className="edit-user-container">
        <AdminHeaderSection />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-user-container">
      <AdminHeaderSection />
      
      <div className="edit-user-content">
        <div className="page-header">
          <div className="page-title">
            <h1>Edit User</h1>
            <p>Update user information and permissions</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/users')}
          >
            Back to Users
          </Button>
        </div>

        <div className="edit-user-form-container">
          <form onSubmit={handleSubmit} className="edit-user-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Account Information</h3>
              <div className="form-row">
                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
                <div className="form-group">
                  <label className="input-label input-required">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="filter-select"
                  >
                    <option value="user">User</option>
                    <option value="tl">Team Lead</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="filter-select"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/users')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                Update User
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="User Updated Successfully"
        size="small"
      >
        <div className="success-message">
          <p>The user has been updated successfully.</p>
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
  );
};

export default EditUser; 