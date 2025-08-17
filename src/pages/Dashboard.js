import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import UserHeaderSection from '../components/UserHeaderSection';
import DashboardFilters from '../components/Dashboard/DashboardFilters';
import LeadsTable from '../components/Dashboard/LeadsTable';
import LeadModals from '../components/Dashboard/LeadModals';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Button from '../components/common/Button';
import { BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Core state variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [callStatuses, setCallStatuses] = useState([]);
  const [allCallStatuses, setAllCallStatuses] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [filteredProductNames, setFilteredProductNames] = useState([]);
  const [budgetList, setBudgetList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [tlUsers, setTlUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [updatingLeads, setUpdatingLeads] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(200);

  // Filters state
  const [filters, setFilters] = useState({
    startDate: new Date('2025-04-01'),
    endDate: new Date(),
    callStatus: 'All',
    productName: 'All',
    mobileSearch: '',
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState({
    name: '',
    contactNumber: ''
  });

  // Modal states
  const [modals, setModals] = useState({
    editLead: { isOpen: false, leadId: null, lead: null },
    viewLead: { isOpen: false, leadId: null, lead: null },
  });

  // Performance optimization states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [dataCache, setDataCache] = useState({});
  const [lastFetchTime, setLastFetchTime] = useState({});
  const [abortController, setAbortController] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

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

  // Filter products based on selected call status
  const filterProductsByCallStatus = useCallback((selectedCallStatus, leadsData = null) => {
    if (selectedCallStatus === 'All') {
      setFilteredProductNames(productNames);
      return;
    }

    const dataToFilter = leadsData || leads;
    const filteredLeads = dataToFilter.filter(lead => 
      lead.callstatus === selectedCallStatus
    );

    const uniqueProducts = [...new Set(
      filteredLeads
        .map(lead => lead.productname)
        .filter(product => product && product.trim() !== '')
    )];

    const filteredProducts = uniqueProducts.map(product => ({ name: product }));
    setFilteredProductNames(filteredProducts);
  }, [leads, productNames]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitialLoading(true);
        
        // Fetch all static data in parallel
        const promises = [
          fetchCallStatuses(),
          fetchAllCallStatuses(),
          fetchProductNames(),
          fetchBudgetList(),
          fetchUnitList(),
          fetchTlUsers()
        ];
        
        await Promise.all(promises);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    if (user) {
      initializeData();
    }
  }, [user]);

  // Fetch leads when filters change
  useEffect(() => {
    if (!isInitialLoading) {
      debouncedFetch(() => {
        if (searchResults.length > 0) {
          applyFiltersToSearchResults();
        } else {
          fetchLeads();
        }
      }, 300);
    }
  }, [filters, user, currentPage, isInitialLoading]);

  // Handle mobile search separately
  useEffect(() => {
    if (!isInitialLoading && filters.mobileSearch) {
      debouncedFetch(() => {
        fetchLeads();
      }, 800);
    }
  }, [filters.mobileSearch, isInitialLoading]);

  // Apply filters to search results
  const applyFiltersToSearchResults = useCallback(() => {
    try {
      if (!searchResults || searchResults.length === 0) {
        setLeads([]);
        setTotalPages(1);
        setTotalItems(0);
        setCurrentPage(1);
        return;
      }

      let filtered = [...searchResults];
      
      // Apply date range filter
      if (filters.startDate && filters.endDate) {
        filtered = filtered.filter(lead => {
          try {
            const leadDate = new Date(lead.createdAt || lead.PostingDate || lead.submiton);
            return leadDate >= filters.startDate && leadDate <= filters.endDate;
          } catch (error) {
            console.error('Error parsing date for lead:', lead, error);
            return true;
          }
        });
      }
      
      // Apply call status filter
      if (filters.callStatus && filters.callStatus !== 'All') {
        filtered = filtered.filter(lead => lead.callstatus === filters.callStatus);
      }
      
      setLeads(filtered);
      
      const total = filtered.length;
      const calculatedPages = Math.ceil(total / itemsPerPage);
      setTotalPages(calculatedPages);
      setTotalItems(total);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error in applyFiltersToSearchResults:', error);
      setLeads([]);
      setTotalPages(1);
      setTotalItems(0);
      setCurrentPage(1);
    }
  }, [searchResults, filters, itemsPerPage]);

  // API functions with caching
  const fetchCallStatuses = async () => {
    const cacheKey = `callStatuses_${user}`;
    
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

  const fetchProductNames = async () => {
    const cacheKey = `productsName_${user}`;
    
    if (dataCache[cacheKey] && isDataFresh(cacheKey)) {
      setProductNames(dataCache[cacheKey]);
      setFilteredProductNames(dataCache[cacheKey]);
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
        setProductNames(data?.data);
        setFilteredProductNames(data?.data);
        updateCache(cacheKey, data?.data);
      } else {
        setError(data.message || 'Failed to fetch product names');
      }
    } catch (error) {
      setError('An error occurred while fetching product names');
    }
  };

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

  // Main leads fetch function
  const fetchLeads = async () => {
    if (!user) return;

    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    setAbortController(controller);

    try {
      setLoading(true);
      setError('');

      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const params = new URLSearchParams({
        callby: user,
        startDate: formatDate(filters.startDate),
        endDate: formatDate(filters.endDate),
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (filters.callStatus !== 'All') {
        params.append('callStatus', filters.callStatus);
      }
      if (filters.productName !== 'All') {
        params.append('productname', filters.productName);
      }
      if (filters.mobileSearch) {
        params.append('mobileSearch', filters.mobileSearch);
      }

      const response = await fetch(`${BASE_URL}/leads/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        signal: controller.signal
      });

      const data = await response.json();
      
      if (data.success) {
        setLeads(data.data || []);
        
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalItems(data.pagination.totalItems || 0);
        } else {
          const total = data.total || (data.data || []).length;
          const calculatedPages = Math.ceil(total / itemsPerPage);
          setTotalPages(calculatedPages);
          setTotalItems(total);
        }
        
        // Filter products after setting leads
        setTimeout(() => {
          filterProductsByCallStatus(filters.callStatus, data.data);
        }, 0);
      } else {
        setError(data.message || 'Failed to fetch leads');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error("API Error:", error);
      setError('An error occurred while fetching leads');
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  // Search function
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
          contactNumber: searchQuery.contactNumber,
          page: 1,
          limit: itemsPerPage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const searchLeads = Array.isArray(data.data) ? data.data : 
                           (data.data && Array.isArray(data.data.leads)) ? data.data.leads : 
                           [];
        
        setSearchResults(searchLeads);
        setLeads(searchLeads);
        setCurrentPage(1);
        
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalItems(data.pagination.totalItems || searchLeads.length);
        } else {
          setTotalPages(Math.ceil(searchLeads.length / itemsPerPage));
          setTotalItems(searchLeads.length);
        }
      } else {
        setError(data.message || 'Search failed');
        setSearchResults([]);
        setLeads([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
      setLeads([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsSearching(false);
    }
  };

  // Event handlers
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    if (filterType === 'callStatus') {
      setFilters(prev => ({ ...prev, productName: 'All' }));
    }
  }, []);

  const handleSearchChange = useCallback((field, value) => {
    setSearchQuery(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery({ name: '', contactNumber: '' });
    setSearchResults([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalItems(0);
    
    setTimeout(() => {
      fetchLeads();
    }, 100);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleEdit = useCallback((lead) => {
    setModals(prev => ({
      ...prev,
      editLead: { 
        isOpen: true, 
        leadId: lead.id, 
        lead: lead 
      }
    }));
  }, []);

  const handleView = useCallback((lead) => {
    setModals(prev => ({
      ...prev,
      viewLead: { 
        isOpen: true, 
        leadId: lead.id, 
        lead: lead 
      }
    }));
  }, []);

  const handleCall = useCallback((phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    window.location.href = `tel:${cleanNumber}`;
  }, []);

  const handleCloseModal = useCallback((modalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: { isOpen: false, leadId: null, lead: null }
    }));
  }, []);

  const handleLeadUpdate = useCallback((leadId, updatedData) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, ...updatedData } : lead
      )
    );
    
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
  }, []);

  const handleAddLead = useCallback(() => {
    navigate('/add-lead');
  }, [navigate]);

  // Memoized filtered leads
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];
    
    // Apply mobile search filter
    if (filters.mobileSearch && filters.mobileSearch.trim()) {
      const searchTerm = filters.mobileSearch.toLowerCase().trim();
      filtered = filtered.filter(lead => {
        const phoneNumber = (lead.ContactNumber || '').toLowerCase();
        const firstName = (lead.FirstName || '').toLowerCase();
        const lastName = (lead.LastName || '').toLowerCase();
        return phoneNumber.includes(searchTerm) || 
               firstName.includes(searchTerm) || 
               lastName.includes(searchTerm);
      });
    }
    
    // Apply product name filter
    if (filters.productName && filters.productName !== 'All') {
      filtered = filtered.filter(lead => 
        lead.productname === filters.productName
      );
    }
    
    return filtered;
  }, [leads, filters.mobileSearch, filters.productName]);

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
          <LoadingSkeleton type="table" rows={10} />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <UserHeaderSection />

      <main className="dashboard-content">
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          callStatuses={callStatuses}
          filteredProductNames={filteredProductNames}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          isSearching={isSearching}
        />

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <LeadsTable
          leads={filteredLeads}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onCall={handleCall}
          updatingLeads={updatingLeads}
          onPageChange={handlePageChange}
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredLeads.length,
            itemsPerPage
          }}
        />

        <LeadModals
          modals={modals}
          onCloseModal={handleCloseModal}
          onLeadUpdate={handleLeadUpdate}
          allCallStatuses={allCallStatuses}
          budgetList={budgetList}
          unitList={unitList}
          tlUsers={tlUsers}
        />
      </main>
    </div>
  );
};

export default Dashboard;
 