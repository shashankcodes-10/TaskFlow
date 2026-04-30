import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach token ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong.'
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please log in again.')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════
export const authAPI = {
  login:    (data)  => api.post('/auth/login', data),
  signup:   (data)  => api.post('/auth/signup', data),
  getMe:    ()      => api.get('/auth/me'),
  getUsers: ()      => api.get('/auth/users'),
}

// ═══════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════
export const projectAPI = {
  getAll:       ()           => api.get('/projects'),
  getById:      (id)         => api.get(`/projects/${id}`),
  create:       (data)       => api.post('/projects', data),
  delete:       (id)         => api.delete(`/projects/${id}`),
  addMember:    (id, userId) => api.post(`/projects/${id}/add-member`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/remove-member`, { data: { userId } }),
}

// ═══════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════
export const taskAPI = {
  getAll:   (params) => api.get('/tasks', { params }),
  getById:  (id)     => api.get(`/tasks/${id}`),
  create:   (data)   => api.post('/tasks', data),
  update:   (id, data) => api.put(`/tasks/${id}`, data),
  delete:   (id)     => api.delete(`/tasks/${id}`),
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
}

export default api
