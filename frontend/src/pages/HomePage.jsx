import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, CheckCircle2, Users, LayoutDashboard, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary btn-sm rounded-full px-6">
            Sign up
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-24 pb-12 relative z-10 flex flex-col items-center text-center">

        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 animate-slide-up" style={{ animationDelay: '0.2s', lineHeight: 1.1 }}>
          Manage your team's work <br className="hidden md:block" />
          with <span className="text-gradient">effortless clarity</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
          The intelligent task management platform designed to help fast-moving teams organize projects, track progress, and ship faster.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Link to="/login" className="btn-secondary btn-lg rounded-full px-8 w-full sm:w-auto">
            Sign in to account
          </Link>
        </div>
      </main>

      <section className="container mx-auto px-6 py-12 relative z-10 border-t border-dark-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Everything you need to ship faster</h2>
          <p className="text-gray-400">Powerful features wrapped in a beautiful, intuitive interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3">Kanban Boards</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Visualize your workflow. Drag and drop tasks between To Do, In Progress, and Done with absolute fluidity.
            </p>
          </div>

          <div className="card p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3">Advanced Tracking</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Never miss a deadline. Track overdue tasks, set priorities, and get detailed dashboard analytics instantly.
            </p>
          </div>

          <div className="card p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3">Team Collaboration</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Assign tasks to team members with strict role-based access control. Let everyone focus on what matters.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-dark-800 py-8 relative z-10">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
