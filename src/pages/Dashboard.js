import React, { useState, useEffect, useCallback, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import UserHeaderSection from '../components/UserHeaderSection';
import { BASE_URL } from '../config';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const Dashboard = () => {
  const { user, logout } = useAuth();
  console.log("users is>>", user)
  
  // Core state variables
  const [startDate, setStartDate] = useState(new Date('2025-04-01')); // August 1 instead of May 1
  const [endDate, setEndDate] = useState(new Date());
  const [callStatus, setCallStatus] = useState('All');
  const [productName, setProductName] = useState('All');
  const [mobileSearch, setMobileSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [callStatuses, setCallStatuses] = useState([]);
  const [productsName, setProductsName] = useState([]);
  const [filteredProductsName, setFilteredProductsName] = useState([]); // New state for filtered products
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(200); // Updated to 200 for better performance
  const [apiResponse, setApiResponse] = useState(null);

  // Performance optimization states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataCache, setDataCache] = useState({});
  const [lastFetchTime, setLastFetchTime] = useState({});
  const [abortController, setAbortController] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Replace the manual pagination states with the hook
  const {
    handlePageChange: hookHandlePageChange,
    updatePaginationData,
    resetPagination
  } = usePagination(currentPage, itemsPerPage);

  // Performance optimization functions
  const isDataFresh = useCallback((key) => {
    const lastFetch = lastFetchTime[key];
    if (!lastFetch) return false;
    return Date.now() - lastFetch < 5 * 60 * 1000; // 5 minutes cache
  }, [lastFetchTime]);

  const updateCache = useCallback((key, data) => {
    setDataCache(prev => ({ ...prev, [key]: data }));
    setLastFetchTime(prev => ({ ...prev, [key]: Date.now() }));
  }, []);

  const debouncedFetch = useCallback((callback, delay = 500) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      callback();
    }, delay);
    
    setDebounceTimer(timer);
  }, [debounceTimer]);

  // New function to filter products based on selected call status
  const filterProductsByCallStatus = useCallback((selectedCallStatus, leadsData = null) => {
    console.log('filterProductsByCallStatus called with:', selectedCallStatus);
    console.log('Current loginUserCallStatus:', loginUserCallStatus);
    console.log('Leads data passed:', leadsData);
    
    if (selectedCallStatus === 'All') {
      setFilteredProductsName(productsName);
      return;
    }

    // Use the passed leadsData if available, otherwise use loginUserCallStatus
    const dataToFilter = leadsData || loginUserCallStatus;
    console.log('Data to filter:', dataToFilter);

    // Filter leads by selected call status and extract unique product names
    const filteredLeads = dataToFilter.filter(lead => 
      lead.callstatus === selectedCallStatus
    );
    
    console.log('Filtered leads for status:', selectedCallStatus, filteredLeads);

    const uniqueProducts = [...new Set(
      filteredLeads
        .map(lead => lead.productname)
        .filter(product => product && product.trim() !== '')
    )];

    // Create product objects with name property to match the structure
    const filteredProducts = uniqueProducts.map(product => ({ name: product }));
    setFilteredProductsName(filteredProducts);
    
    console.log('Final filtered products:', filteredProducts);
  }, [loginUserCallStatus, productsName]);

  // Batch state updates to reduce re-renders
  const updateDashboardData = useCallback((data) => {
    const leadsData = data.data || [];
    console.log('updateDashboardData called with leads:', leadsData);
    
    // Batch all state updates together
    const updates = () => {
      setLeads(leadsData);
      setLoginUserCallStatus(leadsData);
      
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalItems(data.pagination.totalItems || 0);
        console.log("Using backend pagination:", data.pagination);
      } else {
        const total = data.total || leadsData.length;
        const calculatedPages = Math.ceil(total / itemsPerPage);
        setTotalPages(calculatedPages);
        setTotalItems(total);
        console.log("Using fallback pagination - Total:", total, "Pages:", calculatedPages);
      }
      
      setStats({
        totalLeads: data.pagination?.totalItems || data.total || leadsData.length,
        activeLeads: data.activeLeads || 0,
        pendingLeads: data.pendingLeads || 0,
        completedLeads: data.completedLeads || 0
      });
    };
    
    // Use React's batch update for better performance
    React.startTransition(updates);
    
    // Filter products after state updates, passing the leads data directly
    setTimeout(() => {
      filterProductsByCallStatus(callStatus, leadsData);
    }, 0);
  }, [itemsPerPage, callStatus, filterProductsByCallStatus]);

  // Static data - only fetch once on component mount with caching
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsInitialLoading(true);
        
        // Fetch all static data in parallel for better performance
        const promises = [
          fetchCallStatuses(),
          fetchProductsName(),
          fetchAllCallStatuses(),
          fetchBudgetList(),
          fetchUnitList(),
          fetchTlUsers()
        ];
        
        await Promise.all(promises);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, []); // Empty dependency array - only runs once

  // Dynamic data - fetch when filters change with debouncing
  useEffect(() => {
    if (!isInitialLoading) {
      debouncedFetch(() => {
        // If we have search results, apply filters to them instead of fetching new data
        if (searchResults.length > 0) {
          // Apply filters to existing search results
          applyFiltersToSearchResults();
        } else {
          // No search results, fetch new data normally
          fetchLoginUserCallStatus();
        }
      }, 300); // 300ms debounce for better UX
    }
  }, [startDate, endDate, callStatus, user, currentPage, isInitialLoading]); // Removed productName

  // New function to apply filters to search results
  const applyFiltersToSearchResults = useCallback(() => {
    let filtered = searchResults;
    
    // Apply date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.createdAt || lead.PostingDate || lead.submiton);
        return leadDate >= startDate && leadDate <= endDate;
      });
    }
    
    // Apply call status filter
    if (callStatus && callStatus !== 'All') {
      filtered = filtered.filter(lead => lead.callstatus === callStatus);
    }
    
    // Update the displayed data with filtered search results
    setLoginUserCallStatus(filtered);
    
    // Update pagination
    const total = filtered.length;
    const calculatedPages = Math.ceil(total / itemsPerPage);
    setTotalPages(calculatedPages);
    setTotalItems(total);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchResults, startDate, endDate, callStatus, itemsPerPage]);

  // Handle mobile search separately with longer debounce
  useEffect(() => {
    if (!isInitialLoading && mobileSearch) {
      debouncedFetch(() => {
        fetchLoginUserCallStatus();
      }, 800); // 800ms debounce for search
    }
  }, [mobileSearch, isInitialLoading]);

  // Optimized fetch functions with caching
  const fetchCallStatuses = async () => {
    const cacheKey = `callStatuses_${user}`;
    
    // Check cache first
    if (dataCache[cacheKey] && isDataFresh(cacheKey)) {
      setCallStatuses(dataCache[cacheKey]);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/leads/call-statuses?callBy=${user}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCallStatuses(data?.data);
        updateCache(cacheKey, data?.data);
      } else {
        setError(data.message || 'Failed to fetch call statuses');
      }
    } catch (error) {
      setError('An error occurred while fetching call statuses');
    }
  };

  const fetchProductsName = async () => {
    const cacheKey = `productsName_${user}`;
    
    if (dataCache[cacheKey] && isDataFresh(cacheKey)) {
      setProductsName(dataCache[cacheKey]);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/leads/products-name?callBy=${user}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProductsName(data?.data);
        updateCache(cacheKey, data?.data);
      } else {
        setError(data.message || 'Failed to fetch product name');
      }
    } catch (error) {
      setError('An error occurred while fetching product name');
    }
  };

  const fetchAllCallStatuses = async () => {
    const cacheKey = 'allCallStatuses';
    
    if (dataCache[cacheKey] && isDataFresh(cacheKey)) {
      setAllCallStatuses(dataCache[cacheKey]);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/leads/allCallStatus`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAllCallStatuses(data?.data);
        updateCache(cacheKey, data?.data);
      } else {
        setError(data.message || 'Failed to fetch all call statuses');
      }
    } catch (error) {
      setError('An error occurred while fetching all call statuses');
    }
  };

  // Main data fetch with request cancellation and optimization
  const fetchLoginUserCallStatus = async () => {
    if (!user) return;

    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    setAbortController(controller);

    try {
      setIsDataLoading(true);
      setLoading(true);
      console.log("Fetching page:", currentPage, "with limit:", itemsPerPage);

      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const params = new URLSearchParams({
        callby: user,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (callStatus !== 'All') {
        params.append('callStatus', callStatus);
      }
      if (productName !== 'All') {
        params.append('productname', productName);
      }
      if (mobileSearch) {
        params.append('mobileSearch', mobileSearch);
      }

      console.log("API URL:", `${BASE_URL}/leads/?${params.toString()}`);

      const response = await fetch(`${BASE_URL}/leads/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        signal: controller.signal
      });

      const data = await response.json();
      
      // Store the API response for debugging
      setApiResponse(data);
      console.log("API Response:", data);
      
      if (data.success) {
        // Use optimized batch update function
        updateDashboardData(data);
      } else {
        setError(data.message || 'Failed to fetch call status data');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error("API Error:", error);
      setError('An error occurred while fetching call status data');
    } finally {
      setLoading(false);
      setIsDataLoading(false);
      setAbortController(null);
    }
  };

  // Optimized fetch functions for other data
  const fetchBudgetList = async () => {
    const cacheKey = 'budgetList';
    
    if (dataCache[cacheKey] && isDataFresh(cacheKey)) {
      setBudgetList(dataCache[cacheKey]);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/leads/allBudgetsList`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        console.log("budget list data>>", data.data);
        const formattedBudgets = data.data
          .filter(budget => budget.id && budget.namew && !budget.namew.includes('0000'))
          .map(budget => ({
            id: budget.id,
            name: budget.namew || `Budget ${budget.id}`,
            status: budget.status
          }));
        setBudgetList(formattedBudgets);
        updateCache(cacheKey, formattedBudgets);
      } else {
        setError(data.message || 'Failed to fetch budget list');
      }
    } catch (error) {
      setError('An error occurred while fetching budget list');
    }
  };

  const fetchUnitList = async () => {
    const cacheKey = 'unitList';
    
    if (dataCache[cacheKey] && isDataFresh(cacheKey)) {
      setUnitList(dataCache[cacheKey]);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/leads/allUnitslist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUnitList(data.data || []);
        updateCache(cacheKey, data.data || []);
      } else {
        setError(data.message || 'Failed to fetch unit list');
      }
    } catch (error) {
      setError('An error occurred while fetching unit list');
    }
  };

  const fetchTlUsers = async () => {
    const cacheKey = 'tlUsers';
    
    if (dataCache[cacheKey] && isDataFresh(cacheKey)) {
      setTlUsers(dataCache[cacheKey]);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/users/tl`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTlUsers(data.data || []);
        updateCache(cacheKey, data.data || []);
      } else {
        setError(data.message || 'Failed to fetch TL users');
      }
    } catch (error) {
      setError('An error occurred while fetching TL users');
    }
  };

  // Event handlers with optimization
  const handleCallStatusChange = useCallback((e) => {
    const selectedStatus = e.target.value;
    console.log('Call status changed to:', selectedStatus);
    setCallStatus(selectedStatus);
    
    // Reset product name to 'All' when call status changes
    setProductName('All');
    
    // Filter products based on selected call status
    filterProductsByCallStatus(selectedStatus);
  }, [filterProductsByCallStatus]);

  // Update product name change handler to filter locally
  const handleProductNameChange = useCallback((e) => {
    const selectedProduct = e.target.value;
    setProductName(selectedProduct);
    
    // Don't trigger API call - we'll filter locally
    console.log('Product name changed to:', selectedProduct);
  }, []);

  const handleCallClick = useCallback((phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber;
    window.location.href = `tel:${formattedNumber}`;
  }, []);

  const handleMobileSearch = useCallback((e) => {
    setMobileSearch(e.target.value);
  }, []);

  // Optimized filtered leads with useMemo equivalent - updated to include product filtering
  const filteredLeads = React.useMemo(() => {
    // If we have search results, use them directly
    if (searchResults.length > 0) {
      let filtered = searchResults;
      
      // Apply mobile search filter to search results
      if (mobileSearch) {
        const searchTerm = mobileSearch.toLowerCase();
        filtered = filtered.filter(lead => {
          const phoneNumber = lead.ContactNumber?.toLowerCase() || '';
          return phoneNumber.includes(searchTerm);
        });
      }
      
      // Apply product name filter to search results
      if (productName && productName !== 'All') {
        filtered = filtered.filter(lead => 
          lead.productname === productName
        );
      }
      
      return filtered;
    }
    
    // Otherwise, use the regular loginUserCallStatus data
    let filtered = loginUserCallStatus;
    
    // Apply mobile search filter
    if (mobileSearch) {
      const searchTerm = mobileSearch.toLowerCase();
      filtered = filtered.filter(lead => {
        const phoneNumber = lead.ContactNumber?.toLowerCase() || '';
        return phoneNumber.includes(searchTerm);
      });
    }
    
    // Apply product name filter locally
    if (productName && productName !== 'All') {
      filtered = filtered.filter(lead => 
        lead.productname === productName
      );
    }
    
    return filtered;
  }, [loginUserCallStatus, searchResults, mobileSearch, productName]);

  const handleEditClick = useCallback((lead) => {
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
  }, []);

  const handleEditFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formattedFollowup = editForm.followup instanceof Date
        ? editForm.followup.toISOString().split('T')[0]
        : editForm.followup;

      const isClosedStatus = editForm.callstatus === 'Not Interested With Reason' ||
        editForm.callstatus === 'No Response-Lead Closed' ||
        editForm.callstatus === 'Not Qualified' ||
        editForm.callstatus === 'Number Not Answered - 3rd call' ||
        editForm.callstatus === 'Number Not Answered - 2nd call' ||
        editForm.callstatus === 'Number Not Answered';

      if (isClosedStatus) {
        if (!editForm.remarks) {
          setError('Remarks are required for closed leads');
          return;
        }
      } else {
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
        
        // Clear cache for leads data since it changed
        setDataCache(prev => {
          const newCache = { ...prev };
          Object.keys(newCache).forEach(key => {
            if (key.includes('leads') || key.includes('callStatus')) {
              delete newCache[key];
            }
          });
          return newCache;
        });
        
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

  const handleEditCallStatusChange = useCallback((e) => {
    const newStatus = e.target.value;
    setEditForm(prev => ({
      ...prev,
      callstatus: newStatus
    }));

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
  }, []);

  const handleViewClick = useCallback((lead) => {
    setViewingLead(lead);
  }, []);

  const handleSearchInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.name && !searchQuery.contactNumber) {
      setError('Please enter either name or contact number to search');
      return;
    }

    try {
      setIsSearching(true);
      setError('');

      console.log('Searching with query:', searchQuery);

      const response = await fetch(`${BASE_URL}/leads/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: searchQuery.name,
          contactNumber: searchQuery.contactNumber,
          page: currentPage,
          limit: itemsPerPage // Add this to request 200 items per page
        })
      });

      const data = await response.json();
      console.log('Search response:', data);
      
      if (data.success) {
        // Fix: The data is directly in data.data, not data.data.leads
        const searchLeads = data.data || [];
        console.log('Setting search results:', searchLeads);
        setSearchResults(searchLeads);
        setLoginUserCallStatus(searchLeads);
        
        // Also update pagination if the backend provides it
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalItems(data.pagination.totalItems || 0);
          setCurrentPage(data.pagination.currentPage || 1);
        } else {
          resetPagination();
        }
      } else {
        setError(data.message || 'Search failed');
        setSearchResults([]);
        setLoginUserCallStatus([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching');
      setSearchResults([]);
      setLoginUserCallStatus([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = useCallback(() => {
    setSearchQuery({ name: '', contactNumber: '' });
    setSearchResults([]);
    resetPagination();
    // Fetch fresh data after clearing search
    fetchLoginUserCallStatus();
  }, [fetchLoginUserCallStatus]);

  // Optimized page change handler
  const handlePageChange = useCallback((newPage) => {
    console.log("Changing to page:", newPage);
    setCurrentPage(newPage);
  }, []);

  // Date range presets for better UX
  const dateRangePresets = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 60 Days', value: 60 },
    { label: 'Last 90 Days', value: 90 },
    { label: 'Custom Range', value: 'custom' }
  ];

  // Date range preset handler
  const handleDateRangePreset = useCallback((days) => {
    if (days === 'custom') return; // Allow manual selection
    
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [abortController, debounceTimer]);

  // Show loading skeleton while initial data loads
  if (isInitialLoading) {
    return (
      <div className="dashboard-container">
        <UserHeaderSection />
        <main className="dashboard-content">
          <div className="loading-skeleton">
            <div className="skeleton-filters"></div>
            <div className="skeleton-table">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="skeleton-row"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <UserHeaderSection />

      <main className="dashboard-content">
        <div className="dashboard-header-actions">
          <div className="filters-section">
            <div className="filter-group">
            
              <label>Custom Date Range:</label>
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
                <option value="All">All</option>
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
                <option value="All">All</option>
                {filteredProductsName?.map((product, index) => (
                  <option key={index} value={product?.name}>
                    {product?.name}
                  </option>
                ))}
              </select>
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
          <button
            className="add-lead-button"
            onClick={() => navigate('/add-lead')}
          >
            Add New Lead
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Performance Debug Information */}
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '5px', 
          fontSize: '12px' 
        }}>
         
        </div>

        <section className="leads-table">
          {loading ? (
            <div className="loading">
              {isDataLoading ? 'Loading new data...' : 'Loading leads data...'}
            </div>
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
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Call Status</th>
                      <th>Product Name</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id}>
                        <td>{lead.FirstName}</td>
                        <td>{lead.ContactNumber}</td>
                        <td>
                          <span className={`status-badge ${lead?.callstatus?.toLowerCase()}`}>
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

      {/* Add pagination after the leads table */}
      {loginUserCallStatus.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};

export default Dashboard; 