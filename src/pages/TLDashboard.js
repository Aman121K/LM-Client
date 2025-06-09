import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import UserHeaderSection from '../components/UserHeaderSection';
import { BASE_URL } from '../config';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TLDashboard = () => {
  const { user, logout } = useAuth();
  const [startDate, setStartDate] = useState(new Date('2025-05-01'));
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
  const [searchQuery, setSearchQuery] = useState({
    name: '',
    contactNumber: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchCallStatuses();
    fetchTLUserCallStatus();
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

  const fetchTLUserCallStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const params = new URLSearchParams({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        callStatus: callStatus,
        tlId: user // Pass TL's ID to get all users under them
      });

      // Using TL-specific endpoint
      const response = await fetch(`${BASE_URL}/leads/tl-leads?${params.toString()}`, {
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

  const handleCallStatusChange = (e) => {
    const selectedStatus = e.target.value;
    setCallStatus(selectedStatus);
  };

  const handleMobileSearch = (e) => {
    setMobileSearch(e.target.value);
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
        setLoginUserCallStatus(data.data.leads);
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
    fetchTLUserCallStatus(); // Reset to original data
  };

  const handleCallClick = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    window.location.href = `tel:${formattedNumber}`;
  };

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
      const formattedFollowup = editForm.followup instanceof Date 
        ? editForm.followup.toISOString().split('T')[0]
        : editForm.followup;

      const isClosedStatus = editForm.callstatus === 'Not Interested With Reason' || 
                           editForm.callstatus === 'No Response - Lead Closed';

      if (isClosedStatus) {
        if (!editForm.remarks) {
          setError('Remarks are required for closed leads');
          return;
        }
      } else {
        if (!editForm.FirstName || !editForm.LastName || !editForm.ContactNumber || 
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
          budget: editForm.budget
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
        fetchTLUserCallStatus();
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

  const filteredLeads = loginUserCallStatus.filter(lead => {
    if (!mobileSearch) return true;
    const searchTerm = mobileSearch.toLowerCase();
    const phoneNumber = lead.ContactNumber?.toLowerCase() || '';
    return phoneNumber.includes(searchTerm);
  });

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
        </div>

        {/* Rest of the JSX remains the same as Dashboard.js */}
      </main>
    </div>
  );
};

export default TLDashboard; 