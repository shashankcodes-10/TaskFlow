import React from 'react'
import { Calendar, User, AlertCircle, Trash2, Pencil } from 'lucide-react'

const priorityConfig = {
  High:   { cls: 'badge-high',   dot: 'bg-red-400'    },
  Medium: { cls: 'badge-medium', dot: 'bg-yellow-400'  },
  Low:    { cls: 'badge-low',    dot: 'bg-green-400'   },
}

const statusConfig = {
  'To Do':       { cls: 'badge-todo'       },
  'In Progress': { cls: 'badge-inprogress' },
  'Done':        { cls: 'badge-done'       },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TaskCard({ task, onEdit, onDelete, currentUserId }) {
  const isOverdue = task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < new Date()
  const priority  = priorityConfig[task.priority] || priorityConfig.Medium

  return (
    <div
      className={`
        card-hover p-4 group cursor-pointer animate-slide-up
        ${isOverdue ? 'border-red-500/40 bg-red-950/10' : ''}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-100 leading-snug line-clamp-2 flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task) }}
              className="p-1 rounded-md hover:bg-primary-500/20 text-gray-400 hover:text-primary-400 transition-colors"
              title="Edit task"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task._id) }}
              className="p-1 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={priority.cls}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${priority.dot} mr-1`} />
          {task.priority}
        </span>
        {isOverdue && (
          <span className="badge-overdue flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-dark-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center">
            <span className="text-primary-300 font-bold text-[9px]">
              {task.assignedTo?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="truncate max-w-[80px]">{task.assignedTo?.name || 'Unassigned'}</span>
        </div>
        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
          <Calendar className="w-3 h-3" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </div>
    </div>
  )
}
