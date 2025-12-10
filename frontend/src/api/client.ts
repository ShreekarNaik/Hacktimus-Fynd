import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api', // Mock Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
