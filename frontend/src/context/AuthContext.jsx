import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      setUser(JSON.parse(stored))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    toast.success(`Welcome back, ${data.user.name}! 👋`)
    return data.user
  }, [])

  const signup = useCallback(async (name, email, password, role) => {
    const { data } = await api.post('/auth/signup', { name, email, password, role })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    toast.success(`Account created! Welcome, ${data.user.name}! 🎉`)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully.')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
