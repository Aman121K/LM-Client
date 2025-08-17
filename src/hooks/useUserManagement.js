import { useCallback } from 'react';
import { useUserManagement as useUserManagementContext } from '../context/UserManagementContext';

export const useUserManagement = () => {
  const context = useUserManagementContext();
  
  // Create wrapper functions to match the expected interface
  const fetchUsers = useCallback((page = 1, filters = {}) => {
    context.fetchUsers(page, filters);
  }, [context]);

  const fetchTeamLeads = useCallback(() => {
    context.fetchTeamLeads();
  }, [context]);

  const updateUser = useCallback((userId, userData) => {
    return context.updateUser(userId, userData);
  }, [context]);

  const deleteUser = useCallback((userId) => {
    return context.deleteUser(userId);
  }, [context]);

  const bulkUpdateUsers = useCallback((updates) => {
    return context.bulkUpdateUsers(updates);
  }, [context]);

  const setFilters = useCallback((newFilters) => {
    // Handle individual filter updates
    if (typeof newFilters === 'string') {
      // This is a search term
      context.setSearch(newFilters);
    } else {
      // This is a filters object
      Object.entries(newFilters).forEach(([key, value]) => {
        switch (key) {
          case 'search':
            context.setSearch(value);
            break;
          case 'role':
            context.setRoleFilter(value);
            break;
          case 'status':
            context.setStatusFilter(value);
            break;
          case 'teamLead':
            context.setTeamLeadFilter(value);
            break;
          default:
            break;
        }
      });
    }
  }, [context]);

  const setSort = useCallback((sortConfig) => {
    context.setSort(sortConfig);
  }, [context]);

  const setCurrentPage = useCallback((page) => {
    context.setCurrentPage(page);
  }, [context]);

  const toggleUserSelection = useCallback((userId) => {
    context.toggleUserSelection(userId);
  }, [context]);

  const selectAllUsers = useCallback((selectAll) => {
    context.selectAllUsers(selectAll);
  }, [context]);

  const clearMessages = useCallback(() => {
    context.clearMessages();
  }, [context]);

  return {
    // State
    users: context.users,
    teamLeads: context.teamLeads,
    selectedUsers: context.selectedUsers,
    loading: context.loading,
    error: context.error,
    success: context.success,
    pagination: context.pagination,
    filters: context.filters,
    sort: context.sort,
    
    // Actions
    fetchUsers,
    fetchTeamLeads,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
    setFilters,
    setSort,
    setCurrentPage,
    toggleUserSelection,
    selectAllUsers,
    clearMessages
  };
};
