import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động gắn token vào header Authorization nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Tự động xử lý logout nếu token hết hạn (401)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Bắn event để App.tsx xử lý buộc logout
      window.dispatchEvent(new CustomEvent('user-force-logout'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
