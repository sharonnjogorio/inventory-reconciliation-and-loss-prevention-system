import axios from 'axios'

// Base API URL from environment
const API_URL = import.meta.env.VITE_API_URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 10 seconds
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

    console.log('🚀 API Request:', {
      method: config.method,
      url: config.baseURL + config.url,
      data: config.data,
    })

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
    const token = localStorage.getItem('authToken')
    console.log("🔑 Current Token in localStorage:", token)

    if (error.response) {
      console.log("📡 Request Headers:", error.config?.headers)

      switch (error.response.status) {
        case 401:
          console.error('401 Unauthorized:', error.response.data)
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
      console.log('Network error - working offline')
    } else {
      console.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)


export default api