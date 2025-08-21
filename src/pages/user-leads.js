import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';
import UserHeaderSection from '../components/UserHeaderSection';
import './Dashboard.css';
import Pagination from '../components/Pagination';

const UserLeads = () => {
  const { user } = useAuth();
  const [callStatuses, setCallStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingLead, setViewingLead] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchCallStatuses();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user, selectedStatus, currentPage]); // Add currentPage dependency

  const fetchCallStatuses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/all-users-call-status-from-tl/${user}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCallStatuses(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch call statuses');
      }
    } catch (error) {
      setError('An error occurred while fetching call statuses');
    }
  };

  // Update fetchLeads to handle the new pagination structure
  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/leads/tl-data?tlName=${user}&page=${currentPage}&limit=${itemsPerPage}`;
      if (selectedStatus && selectedStatus !== 'all') {
        url += `&callStatus=${encodeURIComponent(selectedStatus)}`;
      }
      
      console.log("User Leads API URL:", url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log("User Leads API Response:", data);
      
      if (data.success) {
        const leadsData = data.data || [];
        setLeads(leadsData);
        
        // Handle the new pagination structure from backend
        if (data.pagination) {
          // Use pagination object from backend
          setTotalPages(data.pagination.totalPages || 1);
          setTotalItems(data.pagination.totalItems || 0);
          console.log("User Leads Using backend pagination:", data.pagination);
        } else {
          // Fallback to old structure
          const total = data.total || leadsData.length;
          const calculatedPages = Math.ceil(total / itemsPerPage);
          setTotalPages(calculatedPages);
          setTotalItems(total);
          console.log("User Leads Using fallback pagination - Total:", total, "Pages:", calculatedPages);
        }
      } else {
        setError(data.message || 'Failed to fetch leads');
      }
    } catch (error) {
      console.error("User Leads API Error:", error);
      setError('An error occurred while fetching leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleViewClick = (lead) => {
    setViewingLead(lead);
  };

  const handleCallClick = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber;
    // const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    window.location.href = `tel:${formattedNumber}`;
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="dashboard-container">
      <UserHeaderSection />
      <main className="dashboard-content">
        <div className="dashboard-header-actions">
          <div className="filters-section" style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '1.5rem 1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div className="filter-group" style={{ minWidth: 180, flex: 1 }}>
              <label>Call Status:</label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
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
          </div>
        </div>
        <section className="leads-table">
          {loading ? (
            <div className="loading">Loading leads data...</div>
          ) : leads.length === 0 ? (
            <div className="no-data-found">
              <div className="no-data-icon">📊</div>
              <h3>No Leads Found</h3>
              <p>There are no leads matching your current filters.</p>
            </div>
          ) : (
            <>
              <div className="lead-count-badge">
                <span className="lead-count-label">Leads Found</span>
                <span className="lead-count-number">{totalItems}</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Call By</th>
                      <th>Product Name</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id}>
                        <td>{lead.FirstName}</td>
                        <td>{lead.ContactNumber}</td>
                        <td>
                        {lead.callby}
                        </td>
                        <td>{lead.productname}</td>
                        <td>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button view"
                              onClick={() => handleViewClick(lead)}
                            >
                              View
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
              {leads.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </>
          )}
        </section>
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
                  <span>{viewingLead.createdAt ? new Date(viewingLead.createdAt).toLocaleString() : ''}</span>
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

export default UserLeads; 