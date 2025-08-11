import { BASE_URL } from '../config';

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Helper function to make API calls with consistent error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const defaultOptions = {
      headers: getAuthHeaders(),
      ...options
    };

    // Remove Content-Type for FormData requests
    if (options.body instanceof FormData) {
      delete defaultOptions.headers['Content-Type'];
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, defaultOptions);
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  // Login user
  login: async (username, password) => {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return await handleApiResponse(response);
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await fetch(`${BASE_URL}/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return await handleApiResponse(response);
  }
};

// User Management APIs
export const userAPI = {
  // Get all users with pagination
  getAllUsers: async (page = 1, limit = 10) => {
    return await apiCall(`/users/allUserList?page=${page}&limit=${limit}`);
  },

  // Get all TL users
  getTLUsers: async () => {
    return await apiCall('/users/tl');
  },

  // Get users under a specific TL
  getUsersUnderTL: async (tlId) => {
    return await apiCall(`/users/under-tl/${tlId}`);
  },

  // Get current user data
  getCurrentUser: async () => {
    return await apiCall('/users/me');
  },

  // Create new user
  createUser: async (userData) => {
    return await apiCall('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Update user
  updateUser: async (userId, userData) => {
    return await apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // Delete user
  deleteUser: async (userId) => {
    return await apiCall(`/users/${userId}`, {
      method: 'DELETE'
    });
  }
};

// Lead Management APIs
export const leadAPI = {
  // Get call statuses for a user
  getCallStatuses: async (callBy) => {
    return await apiCall(`/leads/call-statuses?callBy=${callBy}`);
  },

  // Get all call statuses
  getAllCallStatuses: async () => {
    return await apiCall('/leads/allCallStatus');
  },

  // Get product names for a user
  getProductNames: async (callBy) => {
    return await apiCall(`/leads/products-name?callBy=${callBy}`);
  },

  // Get all budgets list
  getAllBudgetsList: async () => {
    return await apiCall('/leads/allBudgetsList');
  },

  // Get all units list
  getAllUnitsList: async () => {
    return await apiCall('/leads/allUnitslist');
  },

  // Get leads with pagination and filters
  getLeads: async (params = {}, page = 1, limit = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...params
    }).toString();
    return await apiCall(`/leads/?${queryParams}`);
  },

  // Search leads with pagination
  searchLeads: async (searchData, page = 1, limit = 20) => {
    return await apiCall('/leads/search', {
      method: 'POST',
      body: JSON.stringify({ ...searchData, page, limit })
    });
  },

  // Create new lead
  createLead: async (leadData) => {
    return await apiCall('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  },

  // Update lead
  updateLead: async (leadId, leadData) => {
    return await apiCall(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData)
    });
  },

  // Delete lead
  deleteLead: async (leadId) => {
    return await apiCall(`/leads/${leadId}`, {
      method: 'DELETE'
    });
  },

  // Get TL data with pagination
  getTLData: async (tlName, callStatus = null, page = 1, limit = 20) => {
    let url = `/leads/tl-data?tlName=${tlName}&page=${page}&limit=${limit}`;
    if (callStatus) {
      url += `&callStatus=${encodeURIComponent(callStatus)}`;
    }
    return await apiCall(url);
  },

  // Get resale leads with pagination
  getResaleLeads: async (page = 1, limit = 20) => {
    return await apiCall(`/leads/resale-seller?page=${page}&limit=${limit}`);
  },

  // Import leads
  importLeads: async (formData) => {
    return await apiCall('/leads/import', {
      method: 'POST',
      body: formData
    });
  }
};

// Report APIs
export const reportAPI = {
  // Get user reports with pagination
  getUserReports: async (callBy, page = 1, limit = 20) => {
    return await apiCall('/leads/user-reports/', {
      method: 'POST',
      body: JSON.stringify({ callBy, page, limit })
    });
  },

  // Get date range reports with pagination
  getDateRangeReports: async (reportData, page = 1, limit = 20) => {
    return await apiCall('/leads/date-range/', {
      method: 'POST',
      body: JSON.stringify({ ...reportData, page, limit })
    });
  },

  // Get TL users report with pagination
  getTLUsersReport: async (page = 1, limit = 20) => {
    return await apiCall(`/users/tls-users-report?page=${page}&limit=${limit}`);
  },

  // Get daily call completion by TL
  getDailyCallCompletionByTL: async (startDate, endDate) => {
    return await apiCall(`/leads/daily-call-completion-by-tl?startDate=${startDate}&endDate=${endDate}`);
  }
};

// Special APIs
export const specialAPI = {
  // Get all users call status from TL
  getAllUsersCallStatusFromTL: async (tlId) => {
    return await apiCall(`/users/all-users-call-status-from-tl/${tlId}`);
  }
};

// Utility function to format dates for API calls
export const formatDateForAPI = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Export the main API object for easy access
export const API = {
  auth: authAPI,
  users: userAPI,
  leads: leadAPI,
  reports: reportAPI,
  special: specialAPI,
  utils: {
    formatDate: formatDateForAPI
  }
};

export default API;