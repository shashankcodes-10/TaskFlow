import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { taskAPI, projectAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import TaskCard from '../components/TaskCard'
import toast from 'react-hot-toast'
import {
  Plus, Loader2, ArrowLeft, Filter, X, ChevronDown
} from 'lucide-react'

const COLUMNS = ['To Do', 'In Progress', 'Done']

const COL_STYLES = {
  'To Do':       { header: 'text-slate-400 border-slate-600',  bg: 'bg-slate-900/30',   dot: 'bg-slate-400' },
  'In Progress': { header: 'text-blue-400 border-blue-700',    bg: 'bg-blue-950/20',    dot: 'bg-blue-400'  },
  'Done':        { header: 'text-green-400 border-green-800',  bg: 'bg-green-950/20',   dot: 'bg-green-400' },
}

const EMPTY_TASK = {
  title: '', description: '', dueDate: '', priority: 'Medium', status: 'To Do', assignedTo: ''
}

export default function TaskBoardPage() {
  const { id: projectId } = useParams()
  const { user } = useAuth()

  const [project, setProject]   = useState(null)
  const [tasks, setTasks]       = useState([])
  const [members, setMembers]   = useState([])
  const [loading, setLoading]   = useState(true)

  // filters
  const [filterStatus,   setFilterStatus]   = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterAssigned, setFilterAssigned] = useState('')
  const [showFilters,    setShowFilters]    = useState(false)

  // task modal
  const [taskModal, setTaskModal]   = useState({ open: false, mode: 'create', task: null })
  const [taskForm, setTaskForm]     = useState(EMPTY_TASK)
  const [saving, setSaving]         = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, tRes] = await Promise.all([
        projectAPI.getById(projectId),
        taskAPI.getAll({ projectId }),
      ])
      setProject(pRes.data.project)
      const projectMembers = pRes.data.project.members || []
      setMembers(projectMembers.filter(m => m.role === 'Member'))
      setTasks(tRes.data.tasks)
    } catch { toast.error('Failed to load board.') }
    finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Open create modal ──────────────────────────────────────────────────────
  const openCreate = (status = 'To Do') => {
    setTaskForm({ ...EMPTY_TASK, status, assignedTo: user._id })
    setTaskModal({ open: true, mode: 'create', task: null })
  }

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (task) => {
    setTaskForm({
      title:       task.title,
      description: task.description || '',
      dueDate:     task.dueDate ? task.dueDate.slice(0, 10) : '',
      priority:    task.priority,
      status:      task.status,
      assignedTo:  task.assignedTo?._id || task.assignedTo,
    })
    setTaskModal({ open: true, mode: 'edit', task })
  }

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) return toast.error('Task title is required.')
    if (!taskForm.dueDate)      return toast.error('Due date is required.')
    if (!taskForm.assignedTo)   return toast.error('Please assign the task.')
    setSaving(true)
    try {
      if (taskModal.mode === 'create') {
        await taskAPI.create({ ...taskForm, projectId })
        toast.success('Task created!')
      } else {
        await taskAPI.update(taskModal.task._id, taskForm)
        toast.success('Task updated!')
      }
      setTaskModal({ open: false, mode: 'create', task: null })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task.')
    } finally { setSaving(false) }
  }

  // ── Delete task ────────────────────────────────────────────────────────────
  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskAPI.delete(taskId)
      toast.success('Task deleted.')
      setTasks(t => t.filter(x => x._id !== taskId))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete.') }
  }

  // ── Quick status change (drag-free) ───────────────────────────────────────
  const moveTask = async (task, newStatus) => {
    try {
      await taskAPI.update(task._id, { status: newStatus })
      setTasks(ts => ts.map(t => t._id === task._id ? { ...t, status: newStatus } : t))
    } catch { toast.error('Failed to move task.') }
  }

  // ── Filter tasks ───────────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    if (filterStatus   && t.status   !== filterStatus)   return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterAssigned && (t.assignedTo?._id || t.assignedTo) !== filterAssigned) return false
    return true
  })

  const getColTasks = (status) => filtered.filter(t => t.status === status)

  const hasFilters = filterStatus || filterPriority || filterAssigned

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project?.color || '#6366f1' }} />
              <h2 className="text-xl font-bold text-gray-100">{project?.name}</h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 ml-5">{tasks.length} total tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-8 sm:ml-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary btn-sm relative ${hasFilters ? 'border-primary-500 text-primary-400' : ''}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {hasFilters && <span className="w-2 h-2 bg-primary-500 rounded-full absolute -top-1 -right-1" />}
          </button>
          {user?.role === 'Admin' && (
            <button id="create-task-btn" onClick={() => openCreate()} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 card animate-slide-up">
          <select className="input w-auto text-xs py-1.5" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {COLUMNS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input w-auto text-xs py-1.5" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priority</option>
            {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="input w-auto text-xs py-1.5" value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}>
            <option value="">All Members</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterAssigned('') }}
              className="btn-ghost btn-sm text-red-400 hover:text-red-300">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
        {COLUMNS.map(col => {
          const colTasks = getColTasks(col)
          const styles   = COL_STYLES[col]
          return (
            <div key={col} className={`kanban-col ${styles.bg}`}>
              {/* Column header */}
              <div className={`flex items-center justify-between px-1 pb-2 border-b ${styles.header} border-opacity-40`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                  <span className="text-sm font-semibold">{col}</span>
                  <span className="text-xs bg-dark-600 text-gray-400 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                {user?.role === 'Admin' && (
                  <button onClick={() => openCreate(col)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-dark-500 text-gray-500 hover:text-gray-200 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-2 flex-1">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-gray-600 text-center py-8">Drop tasks here</p>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div key={task._id}>
                      <TaskCard task={task} onEdit={openEdit} onDelete={user?.role === 'Admin' ? handleDelete : null} currentUserId={user._id} />
                      {/* Quick move buttons */}
                      <div className="flex gap-1 mt-1 px-1">
                        {COLUMNS.filter(c => c !== col).map(target => (
                          <button key={target} onClick={() => moveTask(task, target)}
                            className="flex-1 text-[10px] text-gray-600 hover:text-gray-300 hover:bg-dark-600 rounded py-0.5 transition-colors truncate">
                            → {target}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open: false, mode: 'create', task: null })}
        title={taskModal.mode === 'create' ? 'Create Task' : 'Edit Task'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input id="task-title" className="input" placeholder="Task title…"
              value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Details…"
              value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date *</label>
              <input id="task-due" type="date" className="input"
                value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select id="task-priority" className="input"
                value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                {COLUMNS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Assign To *</label>
              <select id="task-assign" className="input"
                value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">— Select member —</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setTaskModal({ open: false, mode: 'create', task: null })} className="btn-secondary">Cancel</button>
            <button type="submit" id="save-task" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {taskModal.mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
