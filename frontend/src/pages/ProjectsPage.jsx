import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { projectAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import {
  Plus, FolderKanban, Users, Trash2, UserPlus,
  Loader2, ArrowRight, Shield, Search
} from 'lucide-react'

const PROJECT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']

export default function ProjectsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const [projects, setProjects]   = useState([])
  const [allUsers, setAllUsers]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] })
  const [creating, setCreating]   = useState(false)
  const [memberModal, setMemberModal] = useState({ open: false, project: null })
  const [selectedUser, setSelectedUser] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, uRes] = await Promise.all([projectAPI.getAll(), authAPI.getUsers()])
      setProjects(pRes.data.projects)
      setAllUsers(uRes.data.users)
    } catch { toast.error('Failed to load projects.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) return toast.error('Project name is required.')
    setCreating(true)
    try {
      await projectAPI.create(createForm)
      toast.success('Project created!')
      setCreateOpen(false)
      setCreateForm({ name: '', description: '', color: PROJECT_COLORS[0] })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project.')
    } finally { setCreating(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return
    try {
      await projectAPI.delete(id)
      toast.success('Project deleted.')
      setProjects(p => p.filter(x => x._id !== id))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete.') }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedUser) return toast.error('Select a user.')
    setAddingMember(true)
    try {
      await projectAPI.addMember(memberModal.project._id, selectedUser)
      toast.success('Member added!')
      setMemberModal({ open: false, project: null })
      setSelectedUser('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member.')
    } finally { setAddingMember(false) }
  }

  const handleRemoveMember = async (projectId, userId) => {
    try {
      await projectAPI.removeMember(projectId, userId)
      toast.success('Member removed.')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove member.') }
  }

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Projects</h2>
          <p className="text-sm text-gray-400 mt-1">{projects.length} workspace{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="input pl-9 w-44" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {isAdmin && (
            <button id="create-project-btn" onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{search ? 'No matching projects.' : isAdmin ? 'Create your first project!' : 'No projects yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => {
            const adminId = project.admin?._id || project.admin
            const isProjectAdmin = adminId === user._id
            return (
              <div key={project._id} className="card-hover p-5 flex flex-col gap-4 animate-slide-up">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (project.color || '#6366f1') + '25', border: `1.5px solid ${project.color || '#6366f1'}60` }}>
                      <FolderKanban className="w-5 h-5" style={{ color: project.color || '#6366f1' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100 text-sm">{project.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Shield className="w-3 h-3" />{project.admin?.name}
                      </p>
                    </div>
                  </div>
                  {isProjectAdmin && (
                    <button onClick={() => handleDelete(project._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {project.description && <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>}

                {/* Members */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
                    </span>
                    {isProjectAdmin && (
                      <button onClick={() => { setMemberModal({ open: true, project }); setSelectedUser('') }}
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                        <UserPlus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {project.members?.slice(0, 6).map(m => (
                      <div key={m._id} className="relative group/mem">
                        <div className="w-7 h-7 rounded-full bg-primary-600/30 border border-primary-600/50 flex items-center justify-center cursor-default">
                          <span className="text-primary-300 font-bold text-[10px]">{m.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-dark-600 text-gray-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/mem:opacity-100 transition-opacity z-10 border border-dark-400 flex items-center gap-2">
                          {m.name}
                          {isProjectAdmin && m._id !== adminId && (
                            <button onClick={() => handleRemoveMember(project._id, m._id)} className="text-red-400 hover:text-red-300">✕</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {project.members?.length > 6 && (
                      <div className="w-7 h-7 rounded-full bg-dark-500 border border-dark-400 flex items-center justify-center">
                        <span className="text-gray-400 text-[10px] font-bold">+{project.members.length - 6}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link to={`/projects/${project._id}/board`} className="btn-secondary w-full justify-center group">
                  Open Board <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input id="project-name" className="input" placeholder="e.g. Website Redesign"
              value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What is this project about?"
              value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setCreateForm({ ...createForm, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${createForm.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-700 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" id="submit-project" disabled={creating} className="btn-primary">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={memberModal.open} onClose={() => setMemberModal({ open: false, project: null })}
        title={`Add Member — ${memberModal.project?.name}`}>
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="label">Select User</label>
            <select id="member-select" className="input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">— Choose a user —</option>
              {allUsers
                .filter(u => !memberModal.project?.members?.some(m => m._id === u._id))
                .map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email}) · {u.role}</option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setMemberModal({ open: false, project: null })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={addingMember} className="btn-primary">
              {addingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
