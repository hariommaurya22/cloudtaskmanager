/**
 * CLOUDTASK MANAGER — DASHBOARD
 *
 * Cloud Concepts demonstrated in this file:
 *
 * 1. IaaS (Infrastructure as a Service):
 *    Netlify provides the underlying servers, networking, and CDN infrastructure.
 *    We don't manage any physical hardware or VMs — Netlify handles it all.
 *
 * 2. PaaS (Platform as a Service):
 *    Netlify is the deployment platform. We push code and it handles building,
 *    serving, SSL certificates, CDN distribution, and scaling automatically.
 *
 * 3. DBaaS (Database as a Service):
 *    We simulate this with browser localStorage. In a real cloud app, you would
 *    use a managed database like Firebase Firestore, PlanetScale, or Netlify Blobs
 *    — no server setup required.
 *
 * 4. Storage as a Service:
 *    Static assets (images, icons) can be hosted on cloud CDNs (Cloudinary,
 *    imgix, Netlify Large Media) — no file server to maintain.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  CloudLightning,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Circle,
  LogOut,
  Filter,
  ClipboardList,
  CheckCheck,
  Clock,
  X,
  Save,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: TaskDashboard,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'low' | 'medium' | 'high'
type FilterType = 'all' | 'pending' | 'completed'

interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  completed: boolean
  createdAt: number
}

// ─── localStorage helpers (simulating DBaaS) ──────────────────────────────────

// Each user gets their own task list keyed by email — simulates per-user data isolation.
function getStorageKey(user: string) {
  return `ctm_tasks_${user}`
}

function loadTasks(user: string): Task[] {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(user)) || '[]')
  } catch {
    return []
  }
}

function saveTasks(user: string, tasks: Task[]) {
  // Persisting to localStorage — this simulates writing to a cloud database.
  localStorage.setItem(getStorageKey(user), JSON.stringify(tasks))
}

// ─── Priority badge colors ────────────────────────────────────────────────────

const priorityColors: Record<Priority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

// ─── Main component ───────────────────────────────────────────────────────────

function TaskDashboard() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<FilterType>('all')

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPriority, setFormPriority] = useState<Priority>('medium')

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = localStorage.getItem('ctm_current_user')
    if (!user) {
      navigate({ to: '/login' })
      return
    }
    setCurrentUser(user)
    setTasks(loadTasks(user))
  }, [navigate])

  // ── Persist tasks whenever they change ─────────────────────────────────────
  useEffect(() => {
    if (currentUser) saveTasks(currentUser, tasks)
  }, [tasks, currentUser])

  // ── Task CRUD ────────────────────────────────────────────────────────────────

  const openAddModal = useCallback(() => {
    setEditingTask(null)
    setFormTitle('')
    setFormDesc('')
    setFormPriority('medium')
    setShowModal(true)
  }, [])

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task)
    setFormTitle(task.title)
    setFormDesc(task.description)
    setFormPriority(task.priority)
    setShowModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setEditingTask(null)
  }, [])

  function handleSaveTask(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim()) return

    if (editingTask) {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, title: formTitle.trim(), description: formDesc.trim(), priority: formPriority }
            : t
        )
      )
    } else {
      // Add new task
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: formTitle.trim(),
        description: formDesc.trim(),
        priority: formPriority,
        completed: false,
        createdAt: Date.now(),
      }
      setTasks((prev) => [newTask, ...prev])
    }
    closeModal()
  }

  function toggleComplete(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function handleLogout() {
    localStorage.removeItem('ctm_current_user')
    navigate({ to: '/login' })
  }

  // ── Filtered view ────────────────────────────────────────────────────────────

  const filtered = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <CloudLightning className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CloudTask Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">{currentUser}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Stats cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Tasks"
            value={stats.total}
            icon={<ClipboardList className="w-5 h-5 text-indigo-500" />}
            color="bg-indigo-50"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCheck className="w-5 h-5 text-green-500" />}
            color="bg-green-50"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            color="bg-amber-50"
          />
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
            <Filter className="w-4 h-4 text-gray-400 ml-2 mr-1" />
            {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Add task button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* ── Task list ───────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState filter={filter} onAdd={openAddModal} />
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleComplete}
                onEdit={openEditModal}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}

        {/* ── Cloud concepts info box ─────────────────────────────────────────── */}
        <CloudConceptsPanel />
      </main>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <Modal
          editing={!!editingTask}
          title={formTitle}
          description={formDesc}
          priority={formPriority}
          onTitleChange={setFormTitle}
          onDescChange={setFormDesc}
          onPriorityChange={setFormPriority}
          onSave={handleSaveTask}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className={`${color} rounded-xl p-4 flex items-center gap-3`}>
      <div className="hidden sm:block">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={`bg-white rounded-xl border transition-all shadow-sm hover:shadow-md ${
        task.completed ? 'border-green-200 opacity-75' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Complete toggle */}
        <button
          onClick={() => onToggle(task.id)}
          className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-green-500 transition-colors"
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`font-semibold text-gray-900 ${
                task.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.title}
            </p>
            <span
              className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            aria-label="Edit task"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({
  filter,
  onAdd,
}: {
  filter: FilterType
  onAdd: () => void
}) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
      <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">
        {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
      </p>
      {filter === 'all' && (
        <button
          onClick={onAdd}
          className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          + Add your first task
        </button>
      )}
    </div>
  )
}

function Modal({
  editing,
  title,
  description,
  priority,
  onTitleChange,
  onDescChange,
  onPriorityChange,
  onSave,
  onClose,
}: {
  editing: boolean
  title: string
  description: string
  priority: Priority
  onTitleChange: (v: string) => void
  onDescChange: (v: string) => void
  onPriorityChange: (v: Priority) => void
  onSave: (e: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {editing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Read Chapter 3"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescChange(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value as Priority)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {editing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CloudConceptsPanel() {
  const concepts = [
    {
      label: 'IaaS',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      desc: 'Netlify provides servers, CDN, and networking — no hardware to manage.',
    },
    {
      label: 'PaaS',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-800',
      desc: 'Push code → Netlify builds, deploys, and scales automatically.',
    },
    {
      label: 'DBaaS',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      desc: 'Tasks stored in localStorage (simulating a managed cloud database).',
    },
    {
      label: 'SECaaS',
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      desc: 'Auth managed by the platform (Netlify Identity in production).',
    },
  ]

  return (
    <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <CloudLightning className="w-5 h-5 text-indigo-500" />
        Cloud Computing Concepts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {concepts.map((c) => (
          <div key={c.label} className={`border rounded-lg p-3 ${c.color}`}>
            <p className={`text-xs font-bold mb-1 ${c.textColor}`}>{c.label}</p>
            <p className="text-xs text-gray-600">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
