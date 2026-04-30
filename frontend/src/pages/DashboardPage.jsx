import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  CheckSquare, Clock, AlertCircle, FolderKanban,
  TrendingUp, Calendar, ChevronRight, Loader2
} from 'lucide-react'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
}

function StatCard({ icon: Icon, label, value, iconBg, iconColor, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-100">{value ?? '—'}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  if (!stats) return (
    <div className="text-center text-gray-500 py-20">Failed to load dashboard.</div>
  )

  const { tasksByStatus, tasksByPriority, tasksPerUser, overdueTasks, myTasks, recentTasks } = stats

  // ── Chart data ──────────────────────────────────────────────────────────────
  const statusDoughnut = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      data: [tasksByStatus['To Do'], tasksByStatus['In Progress'], tasksByStatus['Done']],
      backgroundColor: ['#334155', '#1d4ed8', '#16a34a'],
      borderColor:     ['#475569', '#3b82f6', '#22c55e'],
      borderWidth: 2,
    }]
  }

  const priorityBar = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      label: 'Tasks',
      data: [tasksByPriority.Low, tasksByPriority.Medium, tasksByPriority.High],
      backgroundColor: ['#166534', '#854d0e', '#7f1d1d'],
      borderColor:     ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 2,
      borderRadius: 6,
    }]
  }

  const barOpts = {
    ...CHART_OPTS,
    plugins: {
      ...CHART_OPTS.plugins,
      legend: { display: false },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e1e2e' } },
      y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: '#252535' } },
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">Here's what's happening with your projects today.</p>
        </div>
        <Link to="/projects" className="btn-primary hidden sm:flex">
          <FolderKanban className="w-4 h-4" />
          View Projects
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare}  label="Total Tasks"       value={stats.totalTasks}    iconBg="bg-primary-600/20" iconColor="text-primary-400" />
        <StatCard icon={FolderKanban} label="Active Projects"   value={stats.totalProjects} iconBg="bg-blue-600/20"    iconColor="text-blue-400"    />
        <StatCard icon={Clock}        label="In Progress"        value={tasksByStatus['In Progress']} iconBg="bg-yellow-600/20" iconColor="text-yellow-400" />
        <StatCard icon={AlertCircle}  label="Overdue Tasks"      value={stats.overdueCount}  iconBg="bg-red-600/20"     iconColor="text-red-400"   sub="Needs attention" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            Tasks by Status
          </h3>
          <div className="h-52">
            <Doughnut data={statusDoughnut} options={{ ...CHART_OPTS, cutout: '65%' }} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            Tasks by Priority
          </h3>
          <div className="h-52">
            <Bar data={priorityBar} options={barOpts} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Tasks */}
        <div className="card p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary-400" />
            My Tasks
          </h3>
          {myTasks.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No tasks assigned to you.</p>
          ) : (
            <div className="space-y-2">
              {myTasks.map(task => {
                const isOverdue = task.status !== 'Done' && new Date(task.dueDate) < new Date()
                return (
                  <div key={task._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-dark-800 border border-dark-500">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-200 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.projectId?.name}</p>
                    </div>
                    <span className={`text-xs flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            Overdue Tasks
          </h3>
          {overdueTasks.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">🎉 No overdue tasks!</p>
          ) : (
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map(task => (
                <div key={task._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-950/20 border border-red-900/30">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.assignedTo?.name}</p>
                  </div>
                  <span className="text-xs text-red-400 flex-shrink-0">{formatDate(task.dueDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team workload */}
        <div className="card p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            Team Workload
          </h3>
          {tasksPerUser.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {tasksPerUser.slice(0, 5).map(u => (
                <div key={u.userId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-medium truncate max-w-[120px]">{u.name}</span>
                    <span className="text-gray-500">{u.done}/{u.total} done</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-500 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${u.total ? (u.done / u.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
