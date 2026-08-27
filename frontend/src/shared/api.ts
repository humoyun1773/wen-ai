import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('wen_ai_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('wen_ai_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken,
          });
          const newToken = res.data.access_token;
          localStorage.setItem('wen_ai_access_token', newToken);
          if (res.data.refresh_token) {
            localStorage.setItem('wen_ai_refresh_token', res.data.refresh_token);
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('wen_ai_access_token');
          localStorage.removeItem('wen_ai_refresh_token');
          localStorage.removeItem('wen_ai_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
