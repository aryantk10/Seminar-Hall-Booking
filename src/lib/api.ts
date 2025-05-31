import axios from 'axios';

// EMERGENCY FIX: Force production URL when deployed
const getApiUrl = (): string => {
  // If we're on the deployed domain, force production URL
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    console.log('🔗 DEPLOYED: Using production backend URL');
    return 'https://seminar-hall-booking-backend.onrender.com/api';
  }

  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000') {
    console.log('🔗 Using environment variable API URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Development fallback
  console.log('🔗 Using development API URL');
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Halls API
export const halls = {
  getAll: () => api.get('/halls'),
  getById: (id: string) => api.get(`/halls/${id}`),
  create: (data: any) => api.post('/halls', data),
  update: (id: string, data: any) => api.put(`/halls/${id}`, data),
  delete: (id: string) => api.delete(`/halls/${id}`),
  checkAvailability: (id: string, startDate: string, endDate: string) =>
    api.get(`/halls/${id}/availability`, { params: { startDate, endDate } }),
};

// Bookings API
export const bookings = {
  create: (data: any) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  update: (id: string, data: any) => api.put(`/bookings/${id}`, data),
  delete: (id: string) => api.delete(`/bookings/${id}`),
  approve: (id: string) => api.put(`/bookings/${id}/approve`),
  reject: (id: string) => api.put(`/bookings/${id}/reject`),
};

export default api; 