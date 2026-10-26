import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flexi_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('flexi_token');
      localStorage.removeItem('flexi_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.put('/auth/change-password', data),
  getDashboardStats: () => api.get('/auth/dashboard-stats'),
};

// ─── Tasks ─────────────────────────────────────────────────────────────────
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateChecklist: (taskId, itemId, data) =>
    api.patch(`/tasks/${taskId}/checklist/${itemId}`, data),
  getAnalytics: () => api.get('/tasks/analytics'),
};

// ─── Subjects ──────────────────────────────────────────────────────────────
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  addGrade: (id, data) => api.post(`/subjects/${id}/grades`, data),
  addNote: (id, data) => api.post(`/subjects/${id}/notes`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteNote: (id, noteId) => api.delete(`/subjects/${id}/notes/${noteId}`),
};

// ─── Focus Sessions ────────────────────────────────────────────────────────
export const focusAPI = {
  start: (data) => api.post('/focus/start', data),
  complete: (id, data) => api.put(`/focus/${id}/complete`, data),
  delete: (id) => api.delete(`/focus/${id}`),
  getHistory: (params) => api.get('/focus/history', { params }),
};

// ─── Study Goals ───────────────────────────────────────────────────────────
export const goalAPI = {
  getAll: (params) => api.get('/goals', { params }),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  toggleMilestone: (goalId, milestoneId) =>
    api.patch(`/goals/${goalId}/milestone/${milestoneId}`),
};

// ─── Study Groups ──────────────────────────────────────────────────────────
export const groupAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  join: (inviteCode) => api.post('/groups/join', { inviteCode }),
  announce: (id, message) => api.post(`/groups/${id}/announce`, { message }),
  leave: (id) => api.delete(`/groups/${id}/leave`),
};

export default api;
