import axios from 'axios';
import mockAdapter from './mockAdapter';

// Check for Demo Mode flag (ensure you set this in .env or via vite config)
const USE_DEMO = import.meta.env.VITE_USE_DEMO === 'true';

const client = axios.create({
  baseURL: USE_DEMO ? 'http://mock-api' : 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  // If demo mode is on, inject the adapter
  ...(USE_DEMO ? { adapter: mockAdapter } : {})
});

// Add auth token interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

if (USE_DEMO) {
    console.log("%c 🚧 DEMO MODE ACTIVE 🚧 ", "background: #f1c40f; color: black; font-weight: bold; padding: 4px; border-radius: 4px;");
    console.log("Network requests are being intercepted by mockAdapter.");
}

export default client;
