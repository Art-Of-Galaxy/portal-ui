import axios from 'axios';

const apiClient = axios.create({
  baseURL: "http://localhost:7071/",
  headers: { "Content-Type": "application/json" },
});

// Add a request interceptor to include all necessary headers
apiClient.interceptors.request.use(
  (config) => {
    // Example: Add Authorization header if token exists in localStorage
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add any other custom headers here as needed
    // Example: config.headers['X-Custom-Header'] = 'value';

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
