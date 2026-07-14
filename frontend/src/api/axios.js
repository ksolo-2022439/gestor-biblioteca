import axios from 'axios';

const authURL = import.meta.env.VITE_AUTH_URL || 'http://127.0.0.1:3001/api/v1';
const libraryURL = import.meta.env.VITE_LIBRARY_URL || 'http://127.0.0.1:3002/api/v1';
const statisticsURL = import.meta.env.VITE_STATISTICS_URL || 'http://127.0.0.1:3003/api/v1';

export const apiAuth = axios.create({
  baseURL: authURL,
});

export const apiLibrary = axios.create({
  baseURL: libraryURL,
});

export const apiStatistics = axios.create({
  baseURL: statisticsURL,
});

const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-token'] = token;
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

apiLibrary.interceptors.request.use(attachToken, (error) => Promise.reject(error));
apiStatistics.interceptors.request.use(attachToken, (error) => Promise.reject(error));
