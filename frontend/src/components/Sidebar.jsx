import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FolderKanban, LogOut, X, Zap, Shield, User as UserIcon
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects'  },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        flex flex-col w-64 bg-dark-800 border-r border-dark-600
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-dark-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient">TaskFlow</span>
        </div>
        <button onClick={onClose} className="lg:hidden btn-ghost p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
               ${isActive
                 ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                 : 'text-gray-400 hover:bg-dark-600 hover:text-gray-100'
               }`
            }
          >
            <Icon className="w-4.5 h-4.5 w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User card at bottom */}
      <div className="px-3 py-4 border-t border-dark-600">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-dark-700 border border-dark-500">
          <div className="w-9 h-9 rounded-full bg-primary-600/30 border border-primary-600/50 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-300 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-100 truncate">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {user?.role === 'Admin'
                ? <Shield className="w-3 h-3 text-primary-400" />
                : <UserIcon className="w-3 h-3 text-gray-400" />
              }
              <span className="text-xs text-gray-400">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
