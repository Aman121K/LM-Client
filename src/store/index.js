import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import leadsReducer from './slices/leadsSlice';
import usersReducer from './slices/usersSlice';
import reportsReducer from './slices/reportsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadsReducer,
    users: usersReducer,
    reports: reportsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```javascript:src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/apiService';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(username, password);
      if (response.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', user.username);
        localStorage.setItem('userType', user.userType);
        return { user, token };
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred during login');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message || 'Failed to process request');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const initialState = {
  user: localStorage.getItem('user') || null,
  userType: localStorage.getItem('userType') || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  forgotPasswordLoading: false,
  forgotPasswordMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearForgotPasswordMessage: (state) => {
      state.forgotPasswordMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user.username;
        state.userType = action.payload.user.userType;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.userType = null;
        state.token = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordMessage = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordMessage = action.payload;
      });
  },
});

export const { clearError, clearForgotPasswordMessage } = authSlice.actions;
export default authSlice.reducer;
```

```javascript:src/store/slices/leadsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadAPI } from '../../services/apiService';

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async ({ params, page = 1, limit = 200 }, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getLeads(params, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchLeads = createAsyncThunk(
  'leads/searchLeads',
  async ({ searchData, page = 1, limit = 200 }, { rejectWithValue }) => {
    try {
      const response = await leadAPI.searchLeads(searchData, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await leadAPI.createLead(leadData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ leadId, leadData }, { rejectWithValue, getState }) => {
    try {
      const response = await leadAPI.updateLead(leadId, leadData);
      return { response, leadId, leadData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (leadId, { rejectWithValue }) => {
    try {
      await leadAPI.deleteLead(leadId);
      return leadId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCallStatuses = createAsyncThunk(
  'leads/fetchCallStatuses',
  async (callBy, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getCallStatuses(callBy);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllCallStatuses = createAsyncThunk(
  'leads/fetchAllCallStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getAllCallStatuses();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductNames = createAsyncThunk(
  'leads/fetchProductNames',
  async (callBy, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getProductNames(callBy);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBudgetList = createAsyncThunk(
  'leads/fetchBudgetList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getAllBudgetsList();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnitList = createAsyncThunk(
  'leads/fetchUnitList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getAllUnitsList();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  leads: [],
  callStatuses: [],
  allCallStatuses: [],
  productNames: [],
  budgetList: [],
  unitList: [],
  filteredProductNames: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 200,
  },
  searchResults: [],
  isSearching: false,
  updatingLeads: {}, // Track individual lead updates
  creatingLead: false,
  deletingLeads: {}, // Track individual lead deletions
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setCallStatus: (state, action) => {
      state.filters = { ...state.filters, callStatus: action.payload };
    },
    setProductName: (state, action) => {
      state.filters = { ...state.filters, productName: action.payload };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.isSearching = false;
    },
    filterProductsByCallStatus: (state, action) => {
      const selectedCallStatus = action.payload;
      if (selectedCallStatus === 'All') {
        state.filteredProductNames = state.productNames;
      } else {
        const filteredLeads = state.leads.filter(
          lead => lead.callstatus === selectedCallStatus
        );
        const uniqueProducts = [...new Set(
          filteredLeads
            .map(lead => lead.productname)
            .filter(product => product && product.trim() !== '')
        )];
        state.filteredProductNames = uniqueProducts.map(product => ({ name: product }));
      }
    },
    setLeadUpdating: (state, action) => {
      const { leadId, isUpdating } = action.payload;
      state.updatingLeads[leadId] = isUpdating;
    },
    setLeadDeleting: (state, action) => {
      const { leadId, isDeleting } = action.payload;
      state.deletingLeads[leadId] = isDeleting;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            totalPages: action.payload.pagination.totalPages || 1,
            totalItems: action.payload.pagination.totalItems || 0,
          };
        }
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Leads
      .addCase(searchLeads.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchLeads.fulfilled, (state, action) => {
        state.isSearching = false;
        const searchLeads = Array.isArray(action.payload.data) ? action.payload.data : 
                           (action.payload.data && Array.isArray(action.payload.data.leads)) ? action.payload.data.leads : 
                           [];
        state.searchResults = searchLeads;
        state.leads = searchLeads;
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            currentPage: 1,
            totalPages: action.payload.pagination.totalPages || 1,
            totalItems: action.payload.pagination.totalItems || searchLeads.length,
          };
        }
      })
      .addCase(searchLeads.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      })
      // Create Lead
      .addCase(createLead.pending, (state) => {
        state.creatingLead = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state) => {
        state.creatingLead = false;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.creatingLead = false;
        state.error = action.payload;
      })
      // Update Lead
      .addCase(updateLead.pending, (state, action) => {
        const { leadId } = action.meta.arg;
        state.updatingLeads[leadId] = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const { leadId, leadData } = action.payload;
        state.updatingLeads[leadId] = false;
        // Update the lead in the list
        const leadIndex = state.leads.findIndex(lead => lead.id === leadId);
        if (leadIndex !== -1) {
          state.leads[leadIndex] = { ...state.leads[leadIndex], ...leadData };
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        const { leadId } = action.meta.arg;
        state.updatingLeads[leadId] = false;
        state.error = action.payload;
      })
      // Delete Lead
      .addCase(deleteLead.pending, (state, action) => {
        const leadId = action.meta.arg;
        state.deletingLeads[leadId] = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        const leadId = action.payload;
        state.deletingLeads[leadId] = false;
        state.leads = state.leads.filter(lead => lead.id !== leadId);
      })
      .addCase(deleteLead.rejected, (state, action) => {
        const leadId = action.meta.arg;
        state.deletingLeads[leadId] = false;
        state.error = action.payload;
      })
      // Fetch Call Statuses
      .addCase(fetchCallStatuses.fulfilled, (state, action) => {
        state.callStatuses = action.payload.data || [];
      })
      // Fetch All Call Statuses
      .addCase(fetchAllCallStatuses.fulfilled, (state, action) => {
        state.allCallStatuses = action.payload.data || [];
      })
      // Fetch Product Names
      .addCase(fetchProductNames.fulfilled, (state, action) => {
        state.productNames = action.payload.data || [];
        state.filteredProductNames = action.payload.data || [];
      })
      // Fetch Budget List
      .addCase(fetchBudgetList.fulfilled, (state, action) => {
        const formattedBudgets = (action.payload.data || [])
          .filter(budget => budget.id && budget.namew && !budget.namew.includes('0000'))
          .map(budget => ({
            id: budget.id,
            name: budget.namew || `Budget ${budget.id}`,
            status: budget.status
          }));
        state.budgetList = formattedBudgets;
      })
      // Fetch Unit List
      .addCase(fetchUnitList.fulfilled, (state, action) => {
        state.unitList = action.payload.data || [];
      });
  },
});

export const {
  clearError,
  setCurrentPage,
  setCallStatus,
  setProductName,
  clearSearchResults,
  filterProductsByCallStatus,
  setLeadUpdating,
  setLeadDeleting,
} = leadsSlice.actions;

export default leadsSlice.reducer;
```

```javascript:src/store/slices/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/apiService';

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await userAPI.getAllUsers(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTLUsers = createAsyncThunk(
  'users/fetchTLUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getTLUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userAPI.createUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(userId, userData);
      return { response, userId, userData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await userAPI.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  tlUsers: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  creatingUser: false,
  updatingUsers: {},
  deletingUsers: {},
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            totalPages: action.payload.pagination.totalPages || 1,
            totalItems: action.payload.pagination.totalItems || 0,
          };
        }
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch TL Users
      .addCase(fetchTLUsers.fulfilled, (state, action) => {
        state.tlUsers = action.payload.data || [];
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.creatingUser = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.creatingUser = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.creatingUser = false;
        state.error = action.payload;
      })
      // Update User
      .addCase(updateUser.pending, (state, action) => {
        const { userId } = action.meta.arg;
        state.updatingUsers[userId] = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const { userId, userData } = action.payload;
        state.updatingUsers[userId] = false;
        const userIndex = state.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], ...userData };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        state.updatingUsers[userId] = false;
        state.error = action.payload;
      })
      // Delete User
      .addCase(deleteUser.pending, (state, action) => {
        const userId = action.meta.arg;
        state.deletingUsers[userId] = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.deletingUsers[userId] = false;
        state.users = state.users.filter(user => user.id !== userId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        const userId = action.meta.arg;
        state.deletingUsers[userId] = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentPage } = usersSlice.actions;
export default usersSlice.reducer;
```

```javascript:src/store/slices/reportsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportAPI } from '../../services/apiService';

export const fetchTLUsersReport = createAsyncThunk(
  'reports/fetchTLUsersReport',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getTLUsersReport(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserReports = createAsyncThunk(
  'reports/fetchUserReports',
  async ({ callBy, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getUserReports(callBy, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDateRangeReports = createAsyncThunk(
  'reports/fetchDateRangeReports',
  async ({ reportData, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getDateRangeReports(reportData, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tlUsersReport: [],
  userReports: [],
  dateRangeReports: [],
  loading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch TL Users Report
      .addCase(fetchTLUsersReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTLUsersReport.fulfilled, (state, action) => {
        state.loading = false;
        state.tlUsersReport = action.payload.data || [];
      })
      .addCase(fetchTLUsersReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Reports
      .addCase(fetchUserReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.loading = false;
        state.userReports = action.payload.data || [];
      })
      .addCase(fetchUserReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Date Range Reports
      .addCase(fetchDateRangeReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDateRangeReports.fulfilled, (state, action) => {
        state.loading = false;
        state.dateRangeReports = action.payload.data || [];
      })
      .addCase(fetchDateRangeReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
```

```javascript:src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modals: {
    editLead: { isOpen: false, leadId: null },
    viewLead: { isOpen: false, leadId: null },
    deleteLead: { isOpen: false, leadId: null },
    deleteUser: { isOpen: false, userId: null },
  },
  filters: {
    startDate: new Date('2025-04-01'),
    endDate: new Date(),
    callStatus: 'All',
    productName: 'All',
    mobileSearch: '',
  },
  searchQuery: {
    name: '',
    contactNumber: '',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action) => {
      const { modalType, id } = action.payload;
      state.modals[modalType] = { isOpen: true, [`${modalType.replace('Modal', '')}Id`]: id };
    },
    closeModal: (state, action) => {
      const modalType = action.payload;
      state.modals[modalType] = { isOpen: false, [`${modalType.replace('Modal', '')}Id`]: null };
    },
    setFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.filters[filterType] = value;
    },
    setSearchQuery: (state, action) => {
      const { field, value } = action.payload;
      state.searchQuery[field] = value;
    },
    clearFilters: (state) => {
      state.filters = {
        startDate: new Date('2025-04-01'),
        endDate: new Date(),
        callStatus: 'All',
        productName: 'All',
        mobileSearch: '',
      };
    },
    clearSearchQuery: (state) => {
      state.searchQuery = {
        name: '',
        contactNumber: '',
      };
    },
  },
});

export const {
  openModal,
  closeModal,
  setFilter,
  setSearchQuery,
  clearFilters,
  clearSearchQuery,
} = uiSlice.actions;

export default uiSlice.reducer;
```

## 4. Enhanced API Service

```javascript:src/services/apiService.js
import { BASE_URL } from '../config';

// Enhanced error handling
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Request interceptor for better error handling
const createApiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Remove Content-Type for FormData requests
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0, null);
    }
    
    throw new ApiError(error.message || 'An unexpected error occurred', 0, null);
  }
};

// Authentication APIs
export const authAPI = {
  login: async (username, password) => {
    return await createApiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  forgotPassword: async (email) => {
    return await createApiRequest('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// User Management APIs
export const userAPI = {
  getAllUsers: async (page = 1, limit = 10) => {
    return await createApiRequest(`/users/allUserList?page=${page}&limit=${limit}`);
  },

  getTLUsers: async () => {
    return await createApiRequest('/users/tl');
  },

  getUsersUnderTL: async (tlId) => {
    return await createApiRequest(`/users/under-tl/${tlId}`);
  },

  getCurrentUser: async () => {
    return await createApiRequest('/users/me');
  },

  createUser: async (userData) => {
    return await createApiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (userId, userData) => {
    return await createApiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (userId) => {
    return await createApiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Lead Management APIs
export const leadAPI = {
  getCallStatuses: async (callBy) => {
    return await createApiRequest(`/leads/call-statuses?callBy=${callBy}`);
  },

  getAllCallStatuses: async () => {
    return await createApiRequest('/leads/allCallStatus');
  },

  getProductNames: async (callBy) => {
    return await createApiRequest(`/leads/products-name?callBy=${callBy}`);
  },

  getAllBudgetsList: async () => {
    return await createApiRequest('/leads/allBudgetsList');
  },

  getAllUnitsList: async () => {
    return await createApiRequest('/leads/allUnitslist');
  },

  getLeads: async (params = {}, page = 1, limit = 200) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...params,
    }).toString();
    return await createApiRequest(`/leads/?${queryParams}`);
  },

  searchLeads: async (searchData, page = 1, limit = 200) => {
    return await createApiRequest('/leads/search', {
      method: 'POST',
      body: JSON.stringify({ ...searchData, page, limit }),
    });
  },

  createLead: async (leadData) => {
    return await createApiRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  updateLead: async (leadId, leadData) => {
    return await createApiRequest(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  },

  deleteLead: async (leadId) => {
    return await createApiRequest(`/leads/${leadId}`, {
      method: 'DELETE',
    });
  },

  getTLData: async (tlName, callStatus = null, page = 1, limit = 200) => {
    let url = `/leads/tl-data?tlName=${tlName}&page=${page}&limit=${limit}`;
    if (callStatus) {
      url += `&callStatus=${encodeURIComponent(callStatus)}`;
    }
    return await createApiRequest(url);
  },

  getResaleLeads: async (page = 1, limit = 200) => {
    return await createApiRequest(`/leads/resale-seller?page=${page}&limit=${limit}`);
  },

  importLeads: async (formData) => {
    return await createApiRequest('/leads/import', {
      method: 'POST',
      body: formData,
    });
  },
};

// Report APIs
export const reportAPI = {
  getUserReports: async (callBy, page = 1, limit = 200) => {
    return await createApiRequest('/leads/user-reports/', {
      method: 'POST',
      body: JSON.stringify({ callBy, page, limit }),
    });
  },

  getDateRangeReports: async (reportData, page = 1, limit = 200) => {
    return await createApiRequest('/leads/date-range/', {
      method: 'POST',
      body: JSON.stringify({ ...reportData, page, limit }),
    });
  },

  getTLUsersReport: async (page = 1, limit = 200) => {
    return await createApiRequest(`/users/tls-users-report?page=${page}&limit=${limit}`);
  },

  getDailyCallCompletionByTL: async (startDate, endDate) => {
    return await createApiRequest(`/leads/daily-call-completion-by-tl?startDate=${startDate}&endDate=${endDate}`);
  },
};

// Utility functions
export const formatDateForAPI = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Export the main API object
export const API = {
  auth: authAPI,
  users: userAPI,
  leads: leadAPI,
  reports: reportAPI,
  utils: {
    formatDate: formatDateForAPI,
  },
};

export default API;
```

## 5. Redux Hooks

```javascript:src/hooks/redux.js
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector<RootState>;
```

## 6. Updated App.js with Redux Provider

```javascript:src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateUser from './pages/CreateUser';
import AllUsers from './pages/AllUsers';
import EditUser from './pages/EditUser';
import OperatorReport from './pages/OperatorReport';
import AddLead from './pages/AddLead';
import Report from './pages/Report';
import Upload from './pages/Upload';
import TLDashboard from './pages/TLDashboard';
import ResaleLeads from './pages/ResaleLeads';
import UserLeads from './pages/user-leads';
import AdminDayWise from './pages/AdminDayWise';
import ErrorBoundary from './components/ErrorBoundary';

// Create a separate component for routes that uses useAuth
const AppRoutes = () => {
  const { userRole } = useAuth();
  console.log("user ROle is>>", userRole);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/TLdashboard"
        element={
          <ProtectedRoute>
            <TLDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-leads"
        element={
          <ProtectedRoute>
            <UserLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-day-wise"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDayWise />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-user"
        element={
          <ProtectedRoute requiredRole="admin">
            <CreateUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/all-users"
        element={
          <ProtectedRoute requiredRole="admin">
            <AllUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-user/:userId"
        element={
          <ProtectedRoute requiredRole="admin">
            <EditUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator-report"
        element={
          <ProtectedRoute requiredRole="admin">
            <OperatorReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route path="/resale-leads" element={<ResaleLeads />} />
      <Route path="/report" element={<Report />} />
      <Route path="/add-lead" element={<AddLead />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
```

## 7. Refactored Dashboard Component

```javascript:src/pages/Dashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FixedSizeList as List } from 'react-window';
import UserHeaderSection from '../components/UserHeaderSection';
import DashboardFilters from '../components/Dashboard/DashboardFilters';
import LeadsTable from '../components/Dashboard/LeadsTable';
import LeadModals from '../components/Dashboard/LeadModals';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  fetchLeads,
  searchLeads,
  fetchCallStatuses,
  fetchAllCallStatuses,
  fetchProductNames,
  fetchBudgetList,
  fetchUnitList,
  filterProductsByCallStatus,
  clearSearchResults,
  setCurrentPage,
} from '../store/slices/leadsSlice';
import {
  openModal,
  closeModal,
  setFilter,
  setSearchQuery,
  clearFilters,
  clearSearchQuery,
} from '../store/slices/uiSlice';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redux selectors
  const {
    leads,
    callStatuses,
    allCallStatuses,
    productNames,
    filteredProductNames,
    budgetList,
    unitList,
    loading,
    error,
    pagination,
    searchResults,
    isSearching,
    updatingLeads,
  } = useSelector((state) => state.leads);

  const {
    filters,
    searchQuery,
    modals,
  } = useSelector((state) => state.ui);

  // Local state for performance optimization
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Memoized filtered leads
  const filteredLeads = useMemo(() => {
    if (searchResults.length > 0) {
      let filtered = [...searchResults];
      
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
    }
    
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
  }, [leads, searchResults, filters.mobileSearch, filters.productName]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitialLoading(true);
        
        // Fetch all static data in parallel
        await Promise.all([
          dispatch(fetchCallStatuses(user)),
          dispatch(fetchAllCallStatuses()),
          dispatch(fetchProductNames(user)),
          dispatch(fetchBudgetList()),
          dispatch(fetchUnitList()),
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (user) {
      initializeData();
    }
  }, [dispatch, user]);

  // Fetch leads when filters change
  useEffect(() => {
    if (!isIn
