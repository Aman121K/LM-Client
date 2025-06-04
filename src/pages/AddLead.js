import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import './AddLead.css';
import UserHeaderSection from '../components/UserHeaderSection';

const AddLead = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [callStatuses, setCallStatuses] = useState([]);
  const [budgetList, setBudgetList] = useState([]);
  const [unitList, setUnitList] = useState([]);

  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    EmailId: '',
    ContactNumber: '',
    callstatus: '',
    remarks: '',
    followup: new Date().toISOString().split('T')[0],
    productname: '',
    unittype: '',
    budget: ''
  });

  useEffect(() => {
    fetchCallStatuses();
    fetchBudgetList();
    fetchUnitList();
  }, []);

  const fetchCallStatuses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads/allCallStatus`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCallStatuses(data?.data);
      } else {
        setError(data.message || 'Failed to fetch call statuses');
      }
    } catch (error) {
      setError('An error occurred while fetching call statuses');
    }
  };

  const fetchBudgetList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads/allBudgetsList`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const formattedBudgets = data.data
          .filter(budget => budget.id && budget.namew && !budget.namew.includes('0000'))
          .map(budget => ({
            id: budget.id,
            name: budget.namew || `Budget ${budget.id}`,
            status: budget.status
          }));
        setBudgetList(formattedBudgets);
      } else {
        setError(data.message || 'Failed to fetch budget list');
      }
    } catch (error) {
      setError('An error occurred while fetching budget list');
    }
  };

  const fetchUnitList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads/allUnitslist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUnitList(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch unit list');
      }
    } catch (error) {
      setError('An error occurred while fetching unit list');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Failed to add lead');
      }
    } catch (error) {
      setError('An error occurred while adding the lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-lead-container">
      <UserHeaderSection />

      <div className="add-lead-content">
        <h2>Add New Lead</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="LastName"
                value={formData.LastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="EmailId"
                value={formData.EmailId}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Number:</label>
              <input
                type="tel"
                name="ContactNumber"
                value={formData.ContactNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Call Status:</label>
              <select
                name="callstatus"
                value={formData.callstatus}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Call Status</option>
                {callStatuses.map((status, index) => (
                  <option key={index} value={status.name}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Follow Up Date:</label>
              <input
                type="date"
                name="followup"
                value={formData.followup}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                name="productname"
                value={formData.productname}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Unit Type:</label>
              <select
                name="unittype"
                value={formData.unittype}
                onChange={handleInputChange}
              >
                <option value="">Select Unit Type</option>
                {unitList.map((unit, index) => (
                  <option key={index} value={unit.name}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Budget:</label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
              >
                <option value="">Select Budget</option>
                {budgetList.map((budget, index) => (
                  <option key={index} value={budget.name}>
                    {budget.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Remarks:</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Adding Lead...' : 'Add Lead'}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLead; 