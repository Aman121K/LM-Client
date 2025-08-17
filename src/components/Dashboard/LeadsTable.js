import React, { useState, useCallback } from 'react';
import Button from '../common/Button';
import LoadingSkeleton from '../LoadingSkeleton';
import './LeadsTable.css';

const LeadsTable = ({
  leads,
  loading,
  onEdit,
  onView,
  onCall,
  updatingLeads,
  onPageChange,
  pagination
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const sortedLeads = React.useMemo(() => {
    if (!sortConfig.key) return leads;

    return [...leads].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [leads, sortConfig]);

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace(/\s+/g, '-') || 'new';
    return (
      <span className={`status-badge status-${statusClass}`}>
        {status || 'New'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  if (loading) {
    return <LoadingSkeleton type="table" rows={10} />;
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="leads-table-container">
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          <h3 className="empty-state-title">No leads found</h3>
          <p className="empty-state-description">
            Try adjusting your filters or search criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="leads-table-container">
      <div className="leads-table">
        <table>
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('FirstName')}
              >
                Lead Name
                {sortConfig.key === 'FirstName' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('ContactNumber')}
              >
                Contact
                {sortConfig.key === 'ContactNumber' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('EmailId')}
              >
                Email
                {sortConfig.key === 'EmailId' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('callstatus')}
              >
                Status
                {sortConfig.key === 'callstatus' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('productname')}
              >
                Product
                {sortConfig.key === 'productname' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('createdAt')}
              >
                Created Date
                {sortConfig.key === 'createdAt' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.map((lead, index) => (
              <tr 
                key={lead.id || index}
                className={updatingLeads[lead.id] ? 'loading-row' : ''}
              >
                <td>
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
                </td>
                <td>
                  <div className="lead-contact">
                    <div className="contact-phone">
                      <a href={`tel:${lead.ContactNumber}`}>
                        {formatPhoneNumber(lead.ContactNumber)}
                      </a>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="lead-email">
                    <a href={`mailto:${lead.EmailId}`}>
                      {lead.EmailId || '-'}
                    </a>
                  </div>
                </td>
                <td>
                  {getStatusBadge(lead.callstatus)}
                </td>
                <td>
                  <div className="product-info">
                    <div className="product-name">{lead.productname || '-'}</div>
                    <div className="product-details">
                      {lead.unittype && <span>{lead.unittype}</span>}
                      {lead.budget && <span>₹{lead.budget.toLocaleString()}</span>}
                    </div>
                  </div>
                </td>
                <td>
                  {formatDate(lead.createdAt)}
                </td>
                <td>
                  <div className="action-buttons">
                    {updatingLeads[lead.id] ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => onView(lead)}
                          title="View Details"
                        >
                          👁️
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => onEdit(lead)}
                          title="Edit Lead"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="success"
                          size="small"
                          onClick={() => onCall(lead)}
                          title="Call Lead"
                        >
                          📞
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;
