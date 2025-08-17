import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { BASE_URL } from '../config';

const UserManagementContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  SET_USERS: 'SET_USERS',
  SET_TEAM_LEADS: 'SET_TEAM_LEADS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SET_SELECTED_USERS: 'SET_SELECTED_USERS',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES'
};

// Initial state
const initialState = {
  users: [],
  teamLeads: [],
  selectedUsers: [],
  loading: false,
  error: null,
  success: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 100
  },
  filters: {
    search: '',
    role: 'all',
    status: 'all',
    teamLead: 'all'
  },
  sort: {
    field: 'FullName',
    direction: 'asc'
  }
};

// Reducer
function userManagementReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_SUCCESS:
      return { ...state, success: action.payload, loading: false };
    
    case ACTIONS.SET_USERS:
      return { ...state, users: action.payload };
    
    case ACTIONS.SET_TEAM_LEADS:
      return { ...state, teamLeads: action.payload };
    
    case ACTIONS.SET_PAGINATION:
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    
    case ACTIONS.SET_FILTERS:
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 } // Reset to first page on filter change
      };
    
    case ACTIONS.SET_SORT:
      return { ...state, sort: action.payload };
    
    case ACTIONS.SET_SELECTED_USERS:
      return { ...state, selectedUsers: action.payload };
    
    case ACTIONS.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? { ...user, ...action.payload } : user
        )
      };
    
    case ACTIONS.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        selectedUsers: state.selectedUsers.filter(id => id !== action.payload)
      };
    
    case ACTIONS.CLEAR_MESSAGES:
      return { ...state, error: null, success: null };
    
    default:
      return state;
  }
}

// Provider component
export const UserManagementProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userManagementReducer, initialState);

  // Fetch users with caching
  const fetchUsers = useCallback(async (page = 1, filters = {}) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: state.pagination.itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.teamLead !== 'all' && { teamLead: filters.teamLead })
      });

      const response = await fetch(`${BASE_URL}/users/allUserList?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: data.message || 'Failed to fetch users' });
        return;
      }
      
      // Set users data
      dispatch({ type: ACTIONS.SET_USERS, payload: data.data });
      
      // Set pagination data from the API response
      if (data.pagination) {
        dispatch({
          type: ACTIONS.SET_PAGINATION,
          payload: {
            currentPage: data.pagination.currentPage,
            totalItems: data.pagination.totalItems,
            totalPages: data.pagination.totalPages,
            itemsPerPage: data.pagination.itemsPerPage
          }
        });
      } else {
        // Fallback for backward compatibility
        dispatch({
          type: ACTIONS.SET_PAGINATION,
          payload: {
            currentPage: page,
            totalItems: data.total || data.data.length,
            totalPages: Math.ceil((data.total || data.data.length) / state.pagination.itemsPerPage)
          }
        });
      }
      
      // Set loading to false after successful fetch
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'An error occurred while fetching users' });
      // Set loading to false on error as well
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.pagination.itemsPerPage]);

  // Fetch team leads
  const fetchTeamLeads = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/tl`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: ACTIONS.SET_TEAM_LEADS, payload: data.data });
      }
    } catch (error) {
      console.error('Error fetching team leads:', error);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (userId, userData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: data.message || 'Failed to update user' });
        return false;
      }
      
      dispatch({ type: ACTIONS.UPDATE_USER, payload: { id: userId, ...userData } });
      dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'User updated successfully' });
      return true;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'An error occurred while updating user' });
      return false;
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: data.message || 'Failed to delete user' });
        return false;
      }
      
      dispatch({ type: ACTIONS.DELETE_USER, payload: userId });
      dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'User deleted successfully' });
      return true;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'An error occurred while deleting user' });
      return false;
    }
  }, []);

  // Bulk update users
  const bulkUpdateUsers = useCallback(async (updates) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await fetch(`${BASE_URL}/users/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userIds: state.selectedUsers,
          updates
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: data.message || 'Failed to bulk update users' });
        return false;
      }
      
      // Update users in state
      data.data.forEach(updatedUser => {
        dispatch({ type: ACTIONS.UPDATE_USER, payload: updatedUser });
      });
      
      dispatch({ type: ACTIONS.SET_SELECTED_USERS, payload: [] });
      dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Users updated successfully' });
      return true;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'An error occurred while bulk updating users' });
      return false;
    }
  }, [state.selectedUsers]);

  // Action creators
  const actions = {
    setFilters: (filters) => dispatch({ type: ACTIONS.SET_FILTERS, payload: filters }),
    setSort: (sort) => dispatch({ type: ACTIONS.SET_SORT, payload: sort }),
    setCurrentPage: (page) => dispatch({ type: ACTIONS.SET_PAGINATION, payload: { currentPage: page } }),
    toggleUserSelection: (userId) => {
      const newSelected = state.selectedUsers.includes(userId)
        ? state.selectedUsers.filter(id => id !== userId)
        : [...state.selectedUsers, userId];
      dispatch({ type: ACTIONS.SET_SELECTED_USERS, payload: newSelected });
    },
    selectAllUsers: (selectAll) => {
      const newSelected = selectAll ? state.users.map(user => user.id) : [];
      dispatch({ type: ACTIONS.SET_SELECTED_USERS, payload: newSelected });
    },
    clearMessages: () => dispatch({ type: ACTIONS.CLEAR_MESSAGES })
  };

  const value = {
    ...state,
    fetchUsers,
    fetchTeamLeads,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
    ...actions
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};

// Custom hook
export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};
