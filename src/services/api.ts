import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401/403 (logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token if invalid/expired
      localStorage.removeItem('auth_token');
      // Optionally redirect to login or dispatch logout action
      // window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  register: async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },
  changeUsername: async (newUsername: string) => {
    const response = await api.post('/auth/change-username', { newUsername });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  }
};

export const dataApi = {
  getData: async () => {
    const response = await api.get('/data');
    return response.data.data;
  },
  saveData: async (data: unknown) => {
    const response = await api.post('/data', { data });
    return response.data;
  }
};

export default api;
