import axios from 'axios';

export const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pawhome_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired and not on login/register/splash/welcome page
      const path = window.location.pathname;
      if (
        path !== '/login' &&
        path !== '/register' &&
        path !== '/' &&
        path !== '/welcome'
      ) {
        localStorage.removeItem('pawhome_token');
        localStorage.removeItem('pawhome_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
