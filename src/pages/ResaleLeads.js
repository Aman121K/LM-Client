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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(200);

  useEffect(() => {
    console.log('Component mounted, fetching leads...');
    fetchResaleLeads();
  }, [currentPage]); // Add currentPage as dependency

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
      console.log('Starting API call for page:', currentPage);
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/leads/resale-seller?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.success) {
        // Handle the standard API response structure
        const leadsData = data.data || [];
        setResaleLeads(leadsData);
        setFilteredLeads(leadsData);
        
        // Handle pagination
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalItems(data.pagination.totalItems || 0);
        } else {
          // Fallback pagination calculation
          const total = data.total || leadsData.length;
          setTotalPages(Math.ceil(total / itemsPerPage));
          setTotalItems(total);
        }
        
        console.log('Successfully loaded', leadsData.length, 'resale leads');
      } else {
        // Handle case where data might be directly in the response
        const leadsData = data.data || data || [];
        setResaleLeads(leadsData);
        setFilteredLeads(leadsData);
        console.log('Loaded', leadsData.length, 'resale leads (fallback)');
      }
    } catch (error) {
      console.error('Error fetching resale leads:', error);
      setError(`Failed to load resale leads: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    setSearchTerm(''); // Clear search when refreshing
    setCurrentPage(1); // Reset to first page
    fetchResaleLeads();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSearchTerm(''); // Clear search when changing pages
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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
              onChange={handleSearchChange}
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
          <>
            <div className="leads-grid">
              {filteredLeads.length > 0 ? (
                <>
                  <div className="leads-summary">
                    <p>
                      Showing {filteredLeads.length} of {resaleLeads.length} leads 
                      (Page {currentPage} of {totalPages}, Total: {totalItems})
                    </p>
                  </div>
                  {filteredLeads.map((lead, index) => (
                    <div key={lead.id || index} className="lead-card">
                      <div className="lead-header">
                        <h3>{`${lead.FirstName || ''} ${lead.LastName || ''}`.trim() || 'N/A'}</h3>
                        <span className={`status-badge ${lead.callstatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {lead.callstatus || 'Pending'}
                        </span>
                      </div>
                      <div className="lead-details">
                        <p><strong>Phone:</strong> {lead.ContactNumber || 'N/A'}</p>
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
                  ))}
                </>
              ) : searchTerm ? (
                <div className="no-leads">
                  <p>No resale leads found matching "{searchTerm}"</p>
                  <button onClick={() => setSearchTerm('')} className="clear-search-button">
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="no-leads">
                  <p>No resale leads found</p>
                  <button onClick={handleRefresh} className="retry-button">
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <span>Page {currentPage} of {totalPages}</span>
                  <span>Total: {totalItems} leads</span>
                </div>
                <div className="pagination-controls">
                  <button 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResaleLeads; 