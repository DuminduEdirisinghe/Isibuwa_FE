/**
 * services/api.js — Axios instance with interceptors
 *
 * SECURITY NOTE: The JWT token is stored in localStorage.
 * Tradeoff: localStorage is accessible to JavaScript, making it
 * vulnerable to XSS attacks. An HttpOnly cookie would be safer
 * in production, but requires additional CSRF protection.
 * For this event site, localStorage is acceptable given that
 * only admin users are authenticated.
 */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor — attach JWT ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('isibuwa_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state and redirect to login
      localStorage.removeItem('isibuwa_token')
      localStorage.removeItem('isibuwa_admin')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// ── Public API functions ──────────────────────────────────────

/** Fetch the current event info */
export const getEvent = () => api.get('/api/event')

/**
 * Submit a booking with a payment slip.
 * @param {FormData} formData — must include name, email, phone, payment_slip
 */
export const submitBooking = (formData) =>
  api.post('/api/bookings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Admin API functions ───────────────────────────────────────

/**
 * @param {string} email
 * @param {string} password
 */
export const adminLogin = (email, password) =>
  api.post('/api/admin/login', { email, password })

/**
 * @param {{ search?: string, status?: string, page?: number, limit?: number }} params
 */
export const getBookings = (params = {}) =>
  api.get('/api/admin/bookings', { params })

/** @param {number} id */
export const getBooking = (id) => api.get(`/api/admin/bookings/${id}`)

/** @param {number} id */
export const approveBooking = (id) => api.patch(`/api/admin/bookings/${id}/approve`)

/** @param {number} id */
export const rejectBooking = (id) => api.patch(`/api/admin/bookings/${id}/reject`)

/** @param {number} id */
export const checkinBooking = (id) => api.patch(`/api/admin/bookings/${id}/checkin`)

/** Fetch admin dashboard stats */
export const getStats = () => api.get('/api/admin/stats')

/** Logout (client-side only — clears token) */
export const adminLogout = () => api.post('/api/admin/logout')

export default api
