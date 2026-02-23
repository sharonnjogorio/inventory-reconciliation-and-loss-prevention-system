import axios from 'axios'

// Base API URL from environment
const API_URL = import.meta.env.VITE_API_URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken')
          window.location.href = '/login'
          break
        case 403:
          console.error('Forbidden - insufficient permissions')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('API Error:', error.response.data)
      }
    } else if (error.request) {
      // Request made but no response (offline)
      console.log('Network error - working offline')
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api