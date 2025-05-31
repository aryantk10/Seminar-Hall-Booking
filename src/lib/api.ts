import axios from 'axios';

// PROPER: Environment-based configuration
const getApiUrl = (): string => {
  // Always prefer environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl) {
    console.log('🔗 Using environment API URL:', envUrl);
    return envUrl;
  }

  // Fallback for development
  const fallbackUrl = 'http://localhost:5000/api';
  console.log('🔗 No environment variable set, using fallback:', fallbackUrl);
  return fallbackUrl;
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