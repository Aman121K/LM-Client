import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import UserHeaderSection from '../components/UserHeaderSection';
import { BASE_URL } from '../config';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [callStatus, setCallStatus] = useState('All');
  const [mobileSearch, setMobileSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [callStatuses, setCallStatuses] = useState([]);
  const [loginUserCallStatus, setLoginUserCallStatus] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    pendingLeads: 0,
    completedLeads: 0
  });
  const [editingLead, setEditingLead] = useState(null);
  const [editForm, setEditForm] = useState({
    FirstName: '',
    LastName: '',
    EmailId: '',
    ContactNumber: '',
    callstatus: '',
    remarks: '',
    followup: '',
    productname: '',
    unittype: '',
    budget: ''
  });
  const [budgetList, setBudgetList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [viewingLead, setViewingLead] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCallStatuses();
    fetchLoginUserCallStatus();
    fetchBudgetList();
    fetchUnitList();
  }, [startDate, endDate, callStatus, mobileSearch, user]);

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

  const fetchLoginUserCallStatus = async () => {
    if (!user) return; // Don't fetch if user is not available

    try {
      setLoading(true);
      console.log("user>>>>>>>>", user);
      
      // Format dates to YYYY-MM-DD without time
      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const params = new URLSearchParams({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        callStatus: callStatus,
        callby: user
      });

      const response = await fetch(`${BASE_URL}/leads/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setLoginUserCallStatus(data.data || []);
        setStats({
          totalLeads: data.data.totalLeads || 0,
          activeLeads: data.data.activeLeads || 0,
          pendingLeads: data.data.pendingLeads || 0,
          completedLeads: data.data.completedLeads || 0
        });
      } else {
        setError(data.message || 'Failed to fetch call status data');
      }
    } catch (error) {
      setError('An error occurred while fetching call status data');
    } finally {
      setLoading(false);
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
        console.log("budget list data>>", data.data);
        // Format the data to use namew field and filter out 0000
        const formattedBudgets = data.data
          .filter(budget => budget.id && budget.namew && !budget.namew.includes('0000')) // Filter out 0000 and null values
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

  const handleCallStatusChange = (e) => {
    console.log("selected data>>", e?.target?.value);
    const selectedStatus = e.target.value;
    setCallStatus(selectedStatus);
  };

  const handleCallClick = (phoneNumber) => {
    // Remove any non-numeric characters and ensure it starts with 91
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    window.location.href = `tel:${formattedNumber}`;
  };

  const handleMobileSearch = (e) => {
    setMobileSearch(e.target.value);
  };

  const filteredLeads = loginUserCallStatus.filter(lead => {
    if (!mobileSearch) return true;
    const searchTerm = mobileSearch.toLowerCase();
    const phoneNumber = lead.ContactNumber?.toLowerCase() || '';
    return phoneNumber.includes(searchTerm);
  });

  const handleEditClick = (lead) => {
    setEditingLead(lead);
    setEditForm({
      FirstName: lead.FirstName || '',
      LastName: lead.LastName || '',
      EmailId: lead.EmailId || '',
      ContactNumber: lead.ContactNumber || '',
      callstatus: lead.callstatus || '',
      remarks: lead.remarks || '',
      followup: lead.followup ? new Date(lead.followup) : new Date(),
      productname: lead.productname || '',
      unittype: lead.unittype || '',
      budget: lead.budget || ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Format the followup date to YYYY-MM-DD
      const formattedFollowup = editForm.followup instanceof Date 
        ? editForm.followup.toISOString().split('T')[0]
        : editForm.followup;

      const response = await fetch(`${BASE_URL}/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          FirstName: editForm.FirstName,
          LastName: editForm.LastName,
          EmailId: editForm.EmailId,
          ContactNumber: editForm.ContactNumber,
          callstatus: editForm.callstatus,
          remarks: editForm.remarks,
          followup: formattedFollowup,
          productname: editForm.productname,
          unittype: editForm.unittype,
          budget: editForm.budget
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update the leads list with the edited lead
        setLoginUserCallStatus(prevLeads => 
          prevLeads.map(lead => 
            lead.id === editingLead.id ? { ...lead, ...editForm } : lead
          )
        );
        setEditingLead(null); // Close the edit form
        // Refresh the leads data
        fetchLoginUserCallStatus();
      } else {
        setError(data.message || 'Failed to update lead');
      }
    } catch (error) {
      setError('An error occurred while updating the lead');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (lead) => {
    setViewingLead(lead);
  };

  return (
    <div className="dashboard-container">
      <UserHeaderSection />

      <main className="dashboard-content">
        <div className="dashboard-header-actions">
          <div className="filters-section">
            <div className="filter-group">
              <label>Date Range:</label>
              <div className="date-range">
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="date-picker"
                />
                <span>to</span>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="date-picker"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Call Status:</label>
              <select
                value={callStatus}
                onChange={handleCallStatusChange}
                className="status-select"
              >
                <option value="all">All</option>
                {callStatuses?.map((status, index) => (
                  <option key={index} value={status?.name}>
                    {status?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Search Mobile:</label>
              <input
                type="text"
                value={mobileSearch}
                onChange={handleMobileSearch}
                placeholder="Enter mobile number"
                className="mobile-search"
              />
            </div>
          </div>
          <button 
            className="add-lead-button"
            onClick={() => navigate('/add-lead')}
          >
            Add New Lead
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <section className="leads-table">
          {loading ? (
            <div className="loading">Loading leads data...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="no-data-found">
              <div className="no-data-icon">📊</div>
              <h3>No Leads Found</h3>
              <p>There are no leads matching your current filters.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Call Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>{lead.id}</td>
                      <td>{lead.FirstName}</td>
                      <td>{lead.ContactNumber}</td>
                      <td>{lead.EmailId}</td>
                      <td>
                        <span className={`status-badge ${lead?.callstatus.toLowerCase()}`}>
                          {lead.callstatus}
                        </span>
                      </td>
                      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button view"
                            onClick={() => handleViewClick(lead)}
                          >
                            View
                          </button>
                          <button 
                            className="action-button edit"
                            onClick={() => handleEditClick(lead)}
                          >
                            Edit
                          </button>
                          <button 
                            className="action-button call"
                            onClick={() => handleCallClick(lead.ContactNumber)}
                          >
                            Call
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Edit Form Modal */}
        {editingLead && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Lead</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    name="FirstName"
                    value={editForm.FirstName}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    name="LastName"
                    value={editForm.LastName}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="EmailId"
                    value={editForm.EmailId}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input
                    type="text"
                    name="ContactNumber"
                    value={editForm.ContactNumber}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Call Status:</label>
                  <select
                    name="callstatus"
                    value={editForm.callstatus}
                    onChange={handleEditFormChange}
                  >
                    {callStatuses?.map((status, index) => (
                      <option key={index} value={status?.name}>
                        {status?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={editForm.remarks}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Follow Up Date:</label>
                  <input
                    type="date"
                    name="followup"
                    value={editForm.followup instanceof Date 
                      ? editForm.followup.toISOString().split('T')[0]
                      : editForm.followup}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Product Name:</label>
                  <input
                    type="text"
                    name="productname"
                    value={editForm.productname}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Unit Type:</label>
                  <select
                    name="unittype"
                    value={editForm.unittype}
                    onChange={handleEditFormChange}
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
                    value={editForm.budget}
                    onChange={handleEditFormChange}
                  >
                    <option value="">Select Budget</option>
                    {budgetList.map((budget, index) => (
                      <option key={index} value={budget.name}>
                        {budget.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-button">Update Lead</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setEditingLead(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingLead && (
          <div className="modal-overlay">
            <div className="modal-content view-modal">
              <h2>Lead Details</h2>
              <div className="lead-details">
                <div className="detail-group">
                  <label>ID:</label>
                  <span>{viewingLead.id}</span>
                </div>
                <div className="detail-group">
                  <label>First Name:</label>
                  <span>{viewingLead.FirstName}</span>
                </div>
                <div className="detail-group">
                  <label>Last Name:</label>
                  <span>{viewingLead.LastName}</span>
                </div>
                <div className="detail-group">
                  <label>Email:</label>
                  <span>{viewingLead.EmailId}</span>
                </div>
                <div className="detail-group">
                  <label>Contact Number:</label>
                  <span>{viewingLead.ContactNumber}</span>
                </div>
                <div className="detail-group">
                  <label>Call Status:</label>
                  <span>{viewingLead.callstatus}</span>
                </div>
                <div className="detail-group">
                  <label>Remarks:</label>
                  <span>{viewingLead.remarks}</span>
                </div>
                <div className="detail-group">
                  <label>Follow Up:</label>
                  <span>{viewingLead.followup}</span>
                </div>
                <div className="detail-group">
                  <label>Product Name:</label>
                  <span>{viewingLead.productname}</span>
                </div>
                <div className="detail-group">
                  <label>Unit Type:</label>
                  <span>{viewingLead.unittype}</span>
                </div>
                <div className="detail-group">
                  <label>Budget:</label>
                  <span>{viewingLead.budget}</span>
                </div>
                <div className="detail-group">
                  <label>Created At:</label>
                  <span>{new Date(viewingLead.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setViewingLead(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 