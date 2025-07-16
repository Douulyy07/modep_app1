import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor pour ajouter le token CSRF
authAPI.interceptors.request.use(
  async (config) => {
    // Récupérer le token CSRF pour les requêtes POST/PUT/DELETE
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      try {
        const csrfResponse = await axios.get(`${API_BASE_URL}/auth/csrf/`, {
          withCredentials: true
        });
        const csrfToken = csrfResponse.data.csrfToken;
        config.headers['X-CSRFToken'] = csrfToken;
      } catch (error) {
        console.error('Error getting CSRF token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion si non authentifié
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => authAPI.post('/auth/login/', credentials),
  signup: (userData) => authAPI.post('/auth/signup/', userData),
  logout: () => authAPI.post('/auth/logout/'),
  getUser: () => authAPI.get('/auth/user/'),
  getCsrfToken: () => authAPI.get('/auth/csrf/'),
};

export default authAPI;