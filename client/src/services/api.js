import axios from 'axios';

export const AUTH_TOKEN_KEY = 'tecnilink_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si no hay respuesta de red (servidor caído) o es un error 500
    if (!error.response || error.response.status === 500) {
      window.location.href = '/server-error';
    }
    // Si el token expira o es inválido (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const getHealthStatus = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const registerTechnician = async (payload) => {
  const response = await api.post('/auth/register-technician', payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const loginWithGoogle = async (payload) => {
  const response = await api.post('/auth/google', payload);
  return response.data;
};

export const getCategories = async (params = {}) => {
  const response = await api.get('/categories', { params });
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await api.post('/categories', payload);
  return response.data;
};

export const updateCategory = async (categoryId, payload) => {
  const response = await api.put(`/categories/${categoryId}`, payload);
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`);
  return response.data;
};

export const getRequests = async (params = {}) => {
  const response = await api.get('/requests', { params });
  return response.data;
};

export const createRequest = async (payload) => {
  const response = await api.post('/requests', payload);
  return response.data;
};

export const getRequestById = async (requestId) => {
  const response = await api.get(`/requests/${requestId}`);
  return response.data;
};

export const updateRequest = async (requestId, payload) => {
  const response = await api.put(`/requests/${requestId}`, payload);
  return response.data;
};

export const assignRequest = async (requestId, payload) => {
  const response = await api.patch(`/requests/${requestId}/assign`, payload);
  return response.data;
};

export const updateRequestStatus = async (requestId, payload) => {
  const response = await api.patch(`/requests/${requestId}/status`, payload);
  return response.data;
};

export const cancelRequest = async (requestId) => {
  const response = await api.delete(`/requests/${requestId}`);
  return response.data;
};

export const getRequestComments = async (requestId, params = {}) => {
  const response = await api.get(`/requests/${requestId}/comments`, { params });
  return response.data;
};

export const createRequestComment = async (requestId, payload) => {
  const response = await api.post(`/requests/${requestId}/comments`, payload);
  return response.data;
};

export const getSuperAdminMetrics = async () => {
  const response = await api.get('/superadmin/metrics');
  return response.data;
};

export const getAdmins = async () => {
  const response = await api.get('/superadmin/admins');
  return response.data;
};

export const createAdmin = async (payload) => {
  const response = await api.post('/superadmin/admins', payload);
  return response.data;
};

export const deactivateAdmin = async (adminId) => {
  const response = await api.patch(`/superadmin/admins/${adminId}/deactivate`);
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/superadmin/audit', { params });
  return response.data;
};

export const getProfileMe = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};

export const updateProfileMe = async (payload) => {
  const response = await api.patch('/profile/me', payload);
  return response.data;
};

export const uploadAvatar = async (formData) => {
  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getTechniciansList = async () => {
  const response = await api.get('/requests/technicians/list');
  return response.data;
};

// System/Company Settings
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (payload) => {
  const response = await api.put('/settings', payload);
  return response.data;
};

// Available requests for Technicians
export const getAvailableRequests = async (params = {}) => {
  const response = await api.get('/requests/available', { params });
  return response.data;
};

export const takeRequest = async (requestId) => {
  const response = await api.post(`/requests/${requestId}/take`);
  return response.data;
};

export const releaseRequest = async (requestId) => {
  const response = await api.post(`/requests/${requestId}/release`);
  return response.data;
};

// Notifications
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationsAsRead = async () => {
  const response = await api.put('/notifications/read');
  return response.data;
};

export { api };
