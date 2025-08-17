import axios from 'axios';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
};

// Leads API
export const leadAPI = {
  getAllLeads: (params) => api.get('/leads', { params }),
  getLeadById: (id) => api.get(`/leads/${id}`),
  createLead: (data) => api.post('/leads', data),
  updateLead: (id, data) => api.put(`/leads/${id}`, data),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  bulkUpdate: (data) => api.put('/leads/bulk-update', data),
  getLeadStats: (params) => api.get('/leads/stats', { params }),
  exportLeads: (params) => api.get('/leads/export', { 
    params, 
    responseType: 'blob' 
  }),
};

// Users API
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getTeamMembers: (tlId) => api.get(`/users/team/${tlId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

// Reports API
export const reportAPI = {
  getDashboardStats: (params) => api.get('/reports/dashboard', { params }),
  getLeadReports: (params) => api.get('/reports/leads', { params }),
  getUserReports: (params) => api.get('/reports/users', { params }),
  getOperatorReports: (params) => api.get('/reports/operators', { params }),
  getDayWiseReports: (params) => api.get('/reports/daywise', { params }),
  exportReport: (type, params) => api.get(`/reports/export/${type}`, {
    params,
    responseType: 'blob'
  }),
};

// Upload API
export const uploadAPI = {
  uploadLeads: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload/leads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  getUploadHistory: () => api.get('/upload/history'),
  deleteUpload: (id) => api.delete(`/upload/${id}`),
};

// Utility functions
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;