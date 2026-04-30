import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const location = useLocation()

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'TaskFlow'

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-dark-800 border-b border-dark-600 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-100">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Connected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-600/50 flex items-center justify-center">
            <span className="text-primary-300 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-300">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
