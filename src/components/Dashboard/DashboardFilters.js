import React, { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Button from '../common/Button';
import Input from '../common/Input';
import './DashboardFilters.css';

const DashboardFilters = ({
  filters,
  onFilterChange,
  callStatuses,
  filteredProductNames,
  onSearch,
  searchQuery,
  onSearchChange,
  onClearSearch,
  isSearching
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDateChange = useCallback((field, date) => {
    onFilterChange(field, date);
  }, [onFilterChange]);

  const handleSelectChange = useCallback((field, value) => {
    onFilterChange(field, value);
  }, [onFilterChange]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const nameValue = typeof searchQuery.name === 'string' ? searchQuery.name : '';
    const contactValue = typeof searchQuery.contactNumber === 'string' ? searchQuery.contactNumber : '';
    
    if (nameValue.trim() || contactValue.trim()) {
      onSearch({
        name: nameValue,
        contactNumber: contactValue
      });
    }
  }, [searchQuery, onSearch]);

  const handleClearAll = useCallback(() => {
    onFilterChange('startDate', new Date('2025-04-01'));
    onFilterChange('endDate', new Date());
    onFilterChange('callStatus', 'All');
    onFilterChange('productName', 'All');
    onFilterChange('mobileSearch', '');
    onClearSearch();
  }, [onFilterChange, onClearSearch]);

  // Safely get string values from searchQuery
  const getNameValue = () => {
    return typeof searchQuery.name === 'string' ? searchQuery.name : '';
  };

  const getContactValue = () => {
    return typeof searchQuery.contactNumber === 'string' ? searchQuery.contactNumber : '';
  };

  const isSearchDisabled = () => {
    const nameValue = getNameValue();
    const contactValue = getContactValue();
    return !nameValue.trim() && !contactValue.trim();
  };

  return (
    <div className="dashboard-filters">
      <div className="filters-header">
        <h3 className="filters-title">Filters</h3>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          className="filters-toggle"
        >
          {isExpanded ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      <div className={`filters-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="filters-grid">
          {/* Date Range Filters */}
          <div className="filter-group">
            <label className="filter-label">Start Date</label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              className="filter-input"
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">End Date</label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              className="filter-input"
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
            />
          </div>

          {/* Call Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Call Status</label>
            <select
              value={filters.callStatus}
              onChange={(e) => handleSelectChange('callStatus', e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              {callStatuses.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name Filter */}
          <div className="filter-group">
            <label className="filter-label">Product Name</label>
            <select
              value={filters.productName}
              onChange={(e) => handleSelectChange('productName', e.target.value)}
              className="filter-select"
            >
              <option value="All">All Products</option>
              {filteredProductNames.map((product, index) => (
                <option key={index} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Search Filter */}
          <div className="filter-group">
            <label className="filter-label">Mobile Search</label>
            <Input
              placeholder="Search by name or phone..."
              value={filters.mobileSearch}
              onChange={(e) => handleSelectChange('mobileSearch', e.target.value)}
            />
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <h4 className="search-title">Advanced Search</h4>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-inputs">
              <Input
                placeholder="Search by name..."
                value={getNameValue()}
                onChange={(e) => onSearchChange('name', e.target.value)}
              />
              <Input
                placeholder="Search by contact number..."
                value={getContactValue()}
                onChange={(e) => onSearchChange('contactNumber', e.target.value)}
              />
            </div>
            <div className="search-actions">
              <Button
                type="submit"
                variant="primary"
                loading={isSearching}
                disabled={isSearchDisabled()}
              >
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClearSearch}
                disabled={isSearchDisabled()}
              >
                Clear Search
              </Button>
            </div>
          </form>
        </div>

        {/* Filter Actions */}
        <div className="filters-actions">
          <Button
            variant="secondary"
            onClick={handleClearAll}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
