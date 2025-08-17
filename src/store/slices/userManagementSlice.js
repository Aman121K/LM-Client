import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../config';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async ({ page = 1, limit = 100, search = '', filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...filters
      });

      const response = await fetch(`${BASE_URL}/users/allUserList?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch users');
      }
      
      return {
        users: data.data,
        total: data.total,
        page,
        limit
      };
    } catch (error) {
      return rejectWithValue('An error occurred while fetching users');
    }
  }
);

export const fetchTeamLeads = createAsyncThunk(
  'userManagement/fetchTeamLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/tl`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch team leads');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue('An error occurred while fetching team leads');
    }
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
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
        return rejectWithValue(data.message || 'Failed to update user');
      }
      
      return { userId, userData: data.data };
    } catch (error) {
      return rejectWithValue('An error occurred while updating user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to delete user');
      }
      
      return userId;
    } catch (error) {
      return rejectWithValue('An error occurred while deleting user');
    }
  }
);

export const bulkUpdateUsers = createAsyncThunk(
  'userManagement/bulkUpdateUsers',
  async ({ userIds, updates }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userIds, updates })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to bulk update users');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue('An error occurred while bulk updating users');
    }
  }
);

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

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1; // Reset to first page on search
    },
    setRoleFilter: (state, action) => {
      state.filters.role = action.payload;
      state.pagination.currentPage = 1;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
      state.pagination.currentPage = 1;
    },
    setTeamLeadFilter: (state, action) => {
      state.filters.teamLead = action.payload;
      state.pagination.currentPage = 1;
    },
    setSort: (state, action) => {
      const { field, direction } = action.payload;
      state.sort.field = field;
      state.sort.direction = direction;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    toggleUserSelection: (state, action) => {
      const userId = action.payload;
      const index = state.selectedUsers.indexOf(userId);
      if (index > -1) {
        state.selectedUsers.splice(index, 1);
      } else {
        state.selectedUsers.push(userId);
      }
    },
    selectAllUsers: (state, action) => {
      if (action.payload) {
        state.selectedUsers = state.users.map(user => user.id);
      } else {
        state.selectedUsers = [];
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination.totalItems = action.payload.total;
        state.pagination.totalPages = Math.ceil(action.payload.total / action.payload.limit);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch team leads
      .addCase(fetchTeamLeads.fulfilled, (state, action) => {
        state.teamLeads = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'User updated successfully';
        const index = state.users.findIndex(user => user.id === action.payload.userId);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload.userData };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        state.selectedUsers = state.selectedUsers.filter(id => id !== action.payload);
        state.success = 'User deleted successfully';
      })
      // Bulk update
      .addCase(bulkUpdateUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Users updated successfully';
        state.selectedUsers = [];
        // Update the users in the list
        action.payload.forEach(updatedUser => {
          const index = state.users.findIndex(user => user.id === updatedUser.id);
          if (index !== -1) {
            state.users[index] = { ...state.users[index], ...updatedUser };
          }
        });
      })
      .addCase(bulkUpdateUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSearch,
  setRoleFilter,
  setStatusFilter,
  setTeamLeadFilter,
  setSort,
  setCurrentPage,
  toggleUserSelection,
  selectAllUsers,
  clearError,
  clearSuccess
} = userManagementSlice.actions;

export default userManagementSlice.reducer;
