import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { leadAPI } from '../services/apiService';
import UserHeaderSection from '../components/UserHeaderSection';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Pagination from '../components/Pagination';
import './ResaleLeads.css';

const ResaleLeads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    assignedTo: 'all',
    dateRange: 'all'
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [updatingLead, setUpdatingLead] = useState(null);

  useEffect(() => {
    fetchResaleLeads();
  }, [currentPage, filters]);

  const fetchResaleLeads = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getAllLeads({
        page: currentPage,
        limit: itemsPerPage,
        type: 'resale',
        ...filters
      });
      
      setLeads(response.data.leads);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      setError('Failed to fetch resale leads');
      console.error('Error fetching resale leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const handleUpdateLead = async (leadId, updateData) => {
    try {
      setUpdatingLead(leadId);
      await leadAPI.updateLead(leadId, updateData);
      
      // Update the lead in the local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updateData } : lead
      ));
      
      setShowLeadModal(false);
      setSelectedLead(null);
    } catch (error) {
      setError('Failed to update lead');
      console.error('Error updating lead:', error);
    } finally {
      setUpdatingLead(null);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'name',
      label: 'Lead Name',
      render: (_, lead) => (
        <div className="lead-name">
          <div className="lead-avatar">
            {lead.FirstName?.charAt(0)?.toUpperCase() || 'L'}
          </div>
          <div className="lead-info">
            <div className="lead-full-name">
              {lead.FirstName} {lead.LastName}
            </div>
            <div className="lead-id">ID: {lead.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact Information',
      render: (_, lead) => (
        <div className="lead-contact">
          <div className="contact-email">
            <a href={`mailto:${lead.EmailId}`}>{lead.EmailId}</a>
          </div>
          <div className="contact-phone">
            <a href={`tel:${lead.ContactNumber}`}>{lead.ContactNumber}</a>
          </div>
        </div>
      )
    },
    {
      key: 'property',
      label: 'Property Details',
      render: (_, lead) => (
        <div className="property-details">
          <div className="property-type">{lead.productname || 'N/A'}</div>
          <div className="property-unit">{lead.unittype || 'N/A'}</div>
          <div className="property-budget">
            Budget: ₹{lead.budget ? lead.budget.toLocaleString() : 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, lead) => (
        <span className={`status-badge status-${lead.callstatus}`}>
          {lead.callstatus || 'New'}
        </span>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (_, lead) => lead.assignedTo || 'Unassigned'
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      render: (_, lead) => new Date(lead.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, lead) => (
        <div className="action-buttons">
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleViewLead(lead)}
          >
            View
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => handleViewLead(lead)}
          >
            Update
          </Button>
        </div>
      )
    }
  ];

  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.FirstName?.toLowerCase().includes(searchLower) ||
        lead.LastName?.toLowerCase().includes(searchLower) ||
        lead.EmailId?.toLowerCase().includes(searchLower) ||
        lead.ContactNumber?.includes(filters.search)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.callstatus === filters.status);
    }

    return filtered;
  }, [leads, filters]);

  return (
    <div className="resale-leads-container">
      <UserHeaderSection />
      
      <div className="resale-leads-content">
        <div className="page-header">
          <div className="page-title">
            <h1>Resale Leads</h1>
            <p>Manage and track resale property leads</p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/add-lead'}
          >
            Add New Lead
          </Button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                icon="🔍"
              />
            </div>
            <div className="filter-group">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="follow-up">Follow Up</option>
                <option value="interested">Interested</option>
                <option value="not-interested">Not Interested</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="filter-group">
              <select
                value={filters.assignedTo}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Users</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            <div className="filter-group">
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
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

        {loading ? (
          <LoadingSkeleton type="table" rows={10} />
        ) : (
          <>
            <Table
              columns={tableColumns}
              data={filteredLeads}
              emptyMessage="No resale leads found"
            />

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredLeads.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        title={selectedLead ? `View/Update Lead: ${selectedLead.FirstName} ${selectedLead.LastName}` : 'Lead Details'}
        size="large"
      >
        {selectedLead ? (
          <div className="lead-details-modal">
            <h2>Lead Details</h2>
            <div className="detail-row">
              <strong>Name:</strong> {selectedLead.FirstName} {selectedLead.LastName}
            </div>
            <div className="detail-row">
              <strong>Contact:</strong> {selectedLead.EmailId || selectedLead.ContactNumber}
            </div>
            <div className="detail-row">
              <strong>Product:</strong> {selectedLead.productname || 'N/A'}
            </div>
            <div className="detail-row">
              <strong>Unit Type:</strong> {selectedLead.unittype || 'N/A'}
            </div>
            <div className="detail-row">
              <strong>Budget:</strong> ₹{selectedLead.budget || 'N/A'}
            </div>
            <div className="detail-row">
              <strong>Remarks:</strong> {selectedLead.remarks || 'N/A'}
            </div>
            <div className="detail-row">
              <strong>Status:</strong> <span className={`status-badge status-${selectedLead.callstatus}`}>{selectedLead.callstatus || 'New'}</span>
            </div>
            <div className="detail-row">
              <strong>Assigned To:</strong> {selectedLead.assignedTo || 'Unassigned'}
            </div>
            <div className="detail-row">
              <strong>Created At:</strong> {new Date(selectedLead.createdAt).toLocaleDateString()}
            </div>
            <div className="detail-row">
              <strong>Last Follow Up:</strong> {selectedLead.followup ? new Date(selectedLead.followup).toLocaleDateString() : 'N/A'}
            </div>

            <h3>Update Lead</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const updateData = {
                callstatus: 'interested', // Example update
                remarks: 'Updated remarks',
                followup: new Date().toISOString()
              };
              handleUpdateLead(selectedLead.id, updateData);
            }}>
              <div className="form-row">
                <Input
                  label="New Status"
                  name="newStatus"
                  value="interested"
                  onChange={(e) => {}}
                  required
                />
                <Input
                  label="New Remarks"
                  name="newRemarks"
                  value="Updated remarks"
                  onChange={(e) => {}}
                  required
                />
              </div>
              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowLeadModal(false)}
                  disabled={updatingLead === selectedLead?.id}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={updatingLead === selectedLead?.id}
                >
                  Update Lead
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="no-lead-selected">
            <p>No lead selected for viewing/updating.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResaleLeads; 