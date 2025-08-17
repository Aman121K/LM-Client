import React, { useState } from 'react';
import './AdvancedFilters.css';

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  teamLeads, 
  onClearFilters,
  onExport 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleDateRangeChange = (type, value) => {
    const newDateRange = { ...dateRange, [type]: value };
    setDateRange(newDateRange);
    
    if (newDateRange.startDate && newDateRange.endDate) {
      onFiltersChange({ 
        ...filters, 
        dateRange: newDateRange 
      });
    }
  };

  const clearAllFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.role !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.teamLead !== 'all') count++;
    if (filters.search) count++;
    if (dateRange.startDate && dateRange.endDate) count++;
    return count;
  };

  return (
    <div className="advanced-filters">
      <div className="filters-header">
        <div className="filters-title">
          <h3>Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="active-filters-count">
              {getActiveFiltersCount()} active
            </span>
          )}
        </div>
        
        <div className="filters-actions">
          <button 
            className="advanced-toggle-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
          
          {getActiveFiltersCount() > 0 && (
            <button 
              className="clear-filters-btn"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          )}
          
          <button 
            className="export-btn"
            onClick={onExport}
          >
            Export
          </button>
        </div>
      </div>

      <div className={`filters-content ${showAdvanced ? 'expanded' : ''}`}>
        <div className="filter-row">
          <div className="filter-group">
            <label>User Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="tl">Team Lead</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Login Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Team Lead</label>
            <select
              value={filters.teamLead}
              onChange={(e) => handleFilterChange('teamLead', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Team Leads</option>
              {teamLeads.map(tl => (
                <option key={tl.id} value={tl.Username}>
                  {tl.FullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showAdvanced && (
          <div className="filter-row">
            <div className="filter-group">
              <label>Registration Date Range</label>
              <div className="date-range">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="date-input"
                  placeholder="Start Date"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="date-input"
                  placeholder="End Date"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={`${filters.sortField}-${filters.sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  handleFilterChange('sortField', field);
                  handleFilterChange('sortDirection', direction);
                }}
                className="filter-select"
              >
                <option value="FullName-asc">Name (A-Z)</option>
                <option value="FullName-desc">Name (Z-A)</option>
                <option value="RegDate-desc">Newest First</option>
                <option value="RegDate-asc">Oldest First</option>
                <option value="UserEmail-asc">Email (A-Z)</option>
                <option value="UserEmail-desc">Email (Z-A)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Items Per Page</label>
              <select
                value={filters.itemsPerPage}
                onChange={(e) => handleFilterChange('itemsPerPage', parseInt(e.target.value))}
                className="filter-select"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;
