import axios from 'axios';
import { config, debugConfig, checkEnvironmentSync } from './config';

// Environment-based configuration with sync checking
const getApiUrl = (): string => {
  const syncStatus = checkEnvironmentSync();

  if (config.enableDebug) {
    console.log('🔗 API Configuration:', {
      environment: config.environment,
      configuredUrl: config.apiUrl,
      syncStatus: syncStatus.isSync ? '✅ Synced' : '⚠️ Not Synced',
      timestamp: syncStatus.timestamp
    });
  }

  return config.apiUrl;
};

const API_URL = getApiUrl();

// Initialize debug logging
debugConfig();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for backend wake-up
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

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.message = 'Backend service is starting up. Please wait a moment and try again.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Unable to connect to server. The service may be starting up.';
    }
    return Promise.reject(error);
  }
);

// Auth API
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  department?: string;
  password?: string;
}

export const auth = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: UpdateProfileData) => api.put('/auth/profile', data),
};

// Halls API
interface HallData {
  name: string;
  capacity: number;
  location: string;
  amenities?: string[];
  description?: string;
}

export const halls = {
  getAll: () => api.get('/halls'),
  getById: (id: string) => api.get(`/halls/${id}`),
  create: (data: HallData) => api.post('/halls', data),
  update: (id: string, data: Partial<HallData>) => api.put(`/halls/${id}`, data),
  delete: (id: string) => api.delete(`/halls/${id}`),
  checkAvailability: (id: string, startDate: string, endDate: string) =>
    api.get(`/halls/${id}/availability`, { params: { startDate, endDate } }),
};

// Bookings API
interface BookingData {
  hallId: string;
  startDate: string;
  endDate: string;
  purpose: string;
  attendees?: number;
  requirements?: string;
}

export const bookings = {
  create: (data: BookingData) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  update: (id: string, data: Partial<BookingData>) => api.put(`/bookings/${id}`, data),
  delete: (id: string) => api.delete(`/bookings/${id}`),
  approve: (id: string) => api.put(`/bookings/${id}/approve`),
  reject: (id: string) => api.put(`/bookings/${id}/reject`),
};

export default api; 