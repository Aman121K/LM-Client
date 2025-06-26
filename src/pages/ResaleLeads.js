import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderSection from '../components/UserHeaderSection';
import './ResaleLeads.css';
import { BASE_URL } from '../config';

const ResaleLeads = () => {
  const navigate = useNavigate();
  const [resaleLeads, setResaleLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);

  useEffect(() => {
    console.log('Component mounted, fetching leads...');
    fetchResaleLeads();
  }, []);

  // Filter leads when search term or resaleLeads change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLeads(resaleLeads);
    } else {
      const filtered = resaleLeads.filter(lead => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (lead.FirstName && lead.FirstName.toLowerCase().includes(searchLower)) ||
          (lead.LastName && lead.LastName.toLowerCase().includes(searchLower)) ||
          (lead.ContactNumber && lead.ContactNumber.includes(searchTerm)) ||
          (lead.EmailId && lead.EmailId.toLowerCase().includes(searchLower)) ||
          (lead.remarks && lead.remarks.toLowerCase().includes(searchLower))
        );
      });
      setFilteredLeads(filtered);
    }
  }, [searchTerm, resaleLeads]);

  const fetchResaleLeads = async () => {
    try {
      console.log('Starting API call...');
      setLoading(true);
      const response = await fetch(`${BASE_URL}/leads/resale-seller`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log('Received data:', data?.data);
      
      // Check if data.data exists, otherwise use data directly
      const leadsData = data?.data || data || [];
      setResaleLeads(leadsData);
      setFilteredLeads(leadsData);
    } catch (error) {
      console.error('Error fetching resale leads:', error);
      setError('Failed to load resale leads. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    fetchResaleLeads();
  };

  return (
    <div className="resale-leads-page">
      <UserHeaderSection />

      <div className="resale-leads-container">
        <div className="resale-leads-header">
          <h1>Resale Seller Leads</h1>
          <div className="resale-leads-actions">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleRefresh} className="refresh-button">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading leads...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          <div className="leads-grid">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead, index) => (
                <div key={lead.id || index} className="lead-card">
                  <div className="lead-header">
                    <h3>{`${lead.FirstName || ''} ${lead.LastName || ''}`.trim() || 'N/A'}</h3>
                    <span className={`status-badge ${lead.callstatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {lead.callstatus || 'Pending'}
                    </span>
                  </div>
                  <div className="lead-details">
                    {/* <p><strong>Phone:</strong> {lead.ContactNumber || 'N/A'}</p> */}
                    <p><strong>Email:</strong> {lead.EmailId || 'N/A'}</p>
                    <p><strong>Unit Type:</strong> {lead.unittype || 'N/A'}</p>
                    <p><strong>Budget:</strong> {lead.budget || 'N/A'}</p>
                    <p><strong>Product:</strong> {lead.productname || 'N/A'}</p>
                    <p><strong>Remarks:</strong> {lead.remarks || 'N/A'}</p>
                    <p><strong>Assigned TL:</strong> {lead.assign_tl || 'Not Assigned'}</p>
                    <p><strong>Call By:</strong> {lead.callby || 'Not Assigned'}</p>
                    <p><strong>Created:</strong> {new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-leads">
                <p>No resale leads found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResaleLeads; 