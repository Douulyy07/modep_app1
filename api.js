import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Adherents API
export const adherentsAPI = {
  getAll: (params = {}) => api.get('/adherents/', { params }),
  getById: (id) => api.get(`/adherents/${id}/`),
  create: (data) => api.post('/adherents/', data),
  update: (id, data) => api.put(`/adherents/${id}/`, data),
  delete: (id) => api.delete(`/adherents/${id}/`),
};

// Cotisations API
export const cotisationsAPI = {
  getAll: (params = {}) => api.get('/cotisations/', { params }),
  getById: (id) => api.get(`/cotisations/${id}/`),
  create: (data) => api.post('/cotisations/', data),
  update: (id, data) => api.put(`/cotisations/${id}/`, data),
  patch: (id, data) => api.patch(`/cotisations/${id}/`, data),
  delete: (id) => api.delete(`/cotisations/${id}/`),
};

// Soins API
export const soinsAPI = {
  getAll: (params = {}) => api.get('/soins/', { params }),
  getById: (id) => api.get(`/soins/${id}/`),
  create: (data) => api.post('/soins/', data),
  update: (id, data) => api.put(`/soins/${id}/`, data),
  delete: (id) => api.delete(`/soins/${id}/`),
};

export default api;