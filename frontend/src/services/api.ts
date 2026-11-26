import axios from 'axios'
import {
  emitSessionExpired,
  getStoredToken,
  removeStoredToken,
} from '../utils/session'
import { apiBaseUrl } from './apiBaseUrl'

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      removeStoredToken()
      emitSessionExpired()
    }

    return Promise.reject(error)
  },
)
