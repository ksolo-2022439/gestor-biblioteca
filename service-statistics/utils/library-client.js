import axios from 'axios';

export const getLibraryClient = (token) => {
  const baseURL = process.env.LIBRARY_SERVICE_URL || 'http://127.0.0.1:3002';
  return axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
      'x-token': token
    }
  });
};
