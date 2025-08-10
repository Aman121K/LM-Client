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
  console.log("users is>>", user)
  const [startDate, setStartDate] = useState(new Date('2025-05-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [callStatus, setCallStatus] = useState('All');
  const [productName, setProductName] = useState('All');
  const [mobileSearch, setMobileSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [callStatuses, setCallStatuses] = useState([]);
  const [productsName, setProductsName] = useState([]);
  const [allCallStatuses, setAllCallStatuses] = useState([]);
  const [loginUserCallStatus, setLoginUserCallStatus] = useState([]);
  const [tlUsers, setTlUsers] = useState([]);
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
    budget: '',
    assignedTo: ''
  });
  const [budgetList, setBudgetList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [viewingLead, setViewingLead] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState({
    name: '',
    contactNumber: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Static data - only fetch once on component mount
  useEffect(() => {
    fetchCallStatuses();
    fetchProductsName();
    fetchAllCallStatuses();
    fetchBudgetList();
    fetchUnitList();
    fetchTlUsers();
  }, []); // Empty dependency array - only runs once

  // Dynamic data - fetch when filters change
  useEffect(() => {
    fetchLoginUserCallStatus();
  }, [startDate, endDate, callStatus, mobileSearch, user, productName]);

  const fetchCallStatuses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads/call-statuses?callBy=${user}`, {
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
  const fetchProductsName = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads/products-name?callBy=${user}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProductsName(data?.data);
      } else {
        setError(data.message || 'Failed to fetch product name');
      }
    } catch (error) {
      setError('An error occurred while fetching product name');
    }
  };

  const fetchAllCallStatuses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads/allCallStatus`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAllCallStatuses(data?.data);
      } else {
        setError(data.message || 'Failed to fetch all call statuses');
      }
    } catch (error) {
      setError('An error occurred while fetching all call statuses');
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
        callby: user,
        productname: productName
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

  const fetchTlUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/tl`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTlUsers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch TL users');
      }
    } catch (error) {
      setError('An error occurred while fetching TL users');
    }
  };

  const handleCallStatusChange = (e) => {
    // console.log("selected data>>", e?.target?.value);
    const selectedStatus = e.target.value;
    setCallStatus(selectedStatus);
  };
  const handleProductNameChange = (e) => {
    // console.log("selected data>>", e?.target?.value);
    const productName = e.target.value;
    setProductName(productName);
  };

  const handleCallClick = (phoneNumber) => {
    // Remove any non-numeric characters and ensure it starts with 91
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber;
    // const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
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
      budget: lead.budget || '',
      assignedTo: lead.assignedTo || ''
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

      // Check if call status is one of the closed statuses
      const isClosedStatus = editForm.callstatus === 'Not Interested With Reason' ||
        editForm.callstatus === 'No Response-Lead Closed' ||
        editForm.callstatus === 'Not Qualified' ||
        editForm.callstatus === 'Number Not Answered - 3rd call' ||
        editForm.callstatus === 'Number Not Answered - 2nd call' ||
        editForm.callstatus === 'Number Not Answered';

      // Validate required fields based on call status
      if (isClosedStatus) {
        if (!editForm.remarks) {
          setError('Remarks are required for closed leads');
          return;
        }
      } else {
        // Validate all required fields for active leads
        if (!editForm.FirstName || !editForm.ContactNumber ||
          !editForm.callstatus || !editForm.remarks || !editForm.followup) {
          setError('Please fill in all required fields');
          return;
        }
      }

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
          budget: editForm.budget,
          assignedTo: editForm.assignedTo
        })
      });

      const data = await response.json();
      if (data.success) {
        setLoginUserCallStatus(prevLeads =>
          prevLeads.map(lead =>
            lead.id === editingLead.id ? { ...lead, ...editForm } : lead
          )
        );
        setEditingLead(null);
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

  // Add this new function to handle call status change in edit form
  const handleEditCallStatusChange = (e) => {
    const newStatus = e.target.value;
    setEditForm(prev => ({
      ...prev,
      callstatus: newStatus
    }));

    // If status is closed or number not answered, clear followup date
    if (newStatus === 'Not Interested With Reason' ||
      newStatus === 'No Response-Lead Closed' ||
      newStatus === 'Not Qualified' ||
      newStatus === 'Number Not Answered - 3rd call' ||
      newStatus === 'Number Not Answered - 2nd call' ||
      newStatus === 'Number Not Answered') {
      setEditForm(prev => ({
        ...prev,
        followup: ''
      }));
    }
  };

  const handleViewClick = (lead) => {
    setViewingLead(lead);
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.name && !searchQuery.contactNumber) {
      setError('Please enter either name or contact number to search');
      return;
    }

    try {
      setIsSearching(true);
      setError('');

      const response = await fetch(`${BASE_URL}/leads/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: searchQuery.name,
          contactNumber: searchQuery.contactNumber
        })
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data.leads);
        setLoginUserCallStatus(data.data.leads); // Update the main leads list with search results
      } else {
        setError(data.message || 'Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      setError('An error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery({ name: '', contactNumber: '' });
    setSearchResults([]);
    fetchLoginUserCallStatus(); // Reset to original data
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
              <label>Product Name:</label>
              <select
                value={productName}
                onChange={handleProductNameChange}
                className="status-select"
              >
                <option value="all">All</option>
                {productsName?.map((status, index) => (
                  <option key={index} value={status?.name}>
                    {status?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="filter-group">
              <label>Search Mobile:</label>
              <input
                type="text"
                value={mobileSearch}
                onChange={handleMobileSearch}
                placeholder="Enter mobile number"
                className="mobile-search"
              />
            </div> */}
          </div>

          <div className="or-divider">Or</div>

          <div className="search-section">
            <div className="search-inputs">
              <div className="search-input-group">
                <input
                  type="text"
                  name="name"
                  value={searchQuery.name}
                  onChange={handleSearchInputChange}
                  placeholder="Search by name"
                  className="search-input"
                />
              </div>
              <div className="search-input-group">
                <input
                  type="text"
                  name="contactNumber"
                  value={searchQuery.contactNumber}
                  onChange={handleSearchInputChange}
                  placeholder="Search by contact number"
                  className="search-input"
                />
              </div>
              <div className="search-buttons">
                <button
                  className="search-button"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
                <button
                  className="clear-button"
                  onClick={handleClearSearch}
                  disabled={isSearching}
                >
                  Clear
                </button>
              </div>
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
            <>
              <div className="lead-count-badge">
                <span className="lead-count-label">Leads Found</span>
                <span className="lead-count-number">{filteredLeads.length}</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {/* <th>ID</th> */}
                      <th>Name</th>
                      <th>Mobile</th>
                      {/* <th>Email</th> */}
                      <th>Call Status</th>
                      <th>Product Name</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id}>
                        {/* <td>{lead.id}</td> */}
                        <td>{lead.FirstName}</td>
                        <td>{lead.ContactNumber}</td>
                        {/* <td>{lead.EmailId}</td> */}
                        <td>
                          <span className={`status-badge ${lead?.callstatus.toLowerCase()}`}>
                            {lead.callstatus}
                          </span>
                        </td>
                        <td>{lead.productname}</td>
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
            </>
          )}
        </section>

        {/* Edit Form Modal */}
        {editingLead && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Lead</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Call Status: <span className="required">*</span></label>
                  <select
                    name="callstatus"
                    value={editForm.callstatus}
                    onChange={handleEditCallStatusChange}
                    required
                  >
                    <option value="">Select Call Status</option>
                    {allCallStatuses?.map((status, index) => (
                      <option key={index} value={status?.name}>
                        {status?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Remarks: <span className="required">*</span></label>
                  <textarea
                    name="remarks"
                    value={editForm.remarks}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>

                {editForm.callstatus !== 'Not Interested With Reason' &&
                  editForm.callstatus !== 'No Response-Lead Closed' &&
                  editForm.callstatus !== 'Not Qualified' &&
                  editForm.callstatus !== 'Number Not Answered - 3rd call' &&
                  editForm.callstatus !== 'Number Not Answered - 2nd call' &&
                  editForm.callstatus !== 'Number Not Answered' && (
                    <>
                      <div className="form-group">
                        <label>First Name: <span className="required">*</span></label>
                        <input
                          type="text"
                          name="FirstName"
                          value={editForm.FirstName}
                          onChange={handleEditFormChange}
                          required
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
                        <label>Contact Number: <span className="required">*</span></label>
                        <input
                          type="text"
                          name="ContactNumber"
                          value={editForm.ContactNumber}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Follow Up Date: <span className="required">*</span></label>
                        <input
                          type="date"
                          name="followup"
                          value={editForm.followup instanceof Date
                            ? editForm.followup.toISOString().split('T')[0]
                            : editForm.followup}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Product Name:<span className="required">*</span></label>
                        <input
                          type="text"
                          name="productname"
                          value={editForm.productname}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Unit Type:<span className="required">*</span></label>
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
                        <label>Budget:<span className="required">*</span></label>
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
                    </>
                  )}

                <div className="form-group">
                  <label>Product Name:</label>
                  <select
                    name="assignedTo"
                    value={editForm.assignedTo}
                    onChange={handleEditFormChange}
                  >
                    <option value="">Select TL</option>
                    {tlUsers.map((tl, index) => (
                      <option key={index} value={tl.Username}>
                        {tl.Username}
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
                  <label>Product Name:</label>
                  <span>{viewingLead.assignedTo || 'Not Assigned'}</span>
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