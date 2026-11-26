import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)
// Response Interceptor
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('token/')
    ) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh')

      if (!refreshToken) {
        localStorage.removeItem('access')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/token/refresh/',
          { refresh: refreshToken }
        )

        const newAccessToken = response.data.access

        localStorage.setItem('access', newAccessToken)

        if (response.data.refresh) {
          localStorage.setItem('refresh', response.data.refresh)
        }

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return API(originalRequest)

      } catch (refreshError) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')

        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default API