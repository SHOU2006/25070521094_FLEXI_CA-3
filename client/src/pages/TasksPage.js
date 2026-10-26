import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI, subjectAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2,
  FiClock, FiPaperclip, FiList
} from 'react-icons/fi';


const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const TYPE_OPTIONS = ['assignment', 'exam', 'project', 'quiz', 'reading', 'other'];
const STATUS_OPTIONS = ['todo', 'in-progress', 'completed', 'overdue'];
const PRIORITY_COLORS = { low: '#10b981', medium: '#06b6d4', high: '#f59e0b', urgent: '#ef4444' };

function DeadlineLabel({ deadline, status }) {
  if (status === 'completed') return <span style={{ color: '#10b981', fontSize: 12 }}>✅ Completed</span>;
  const d = new Date(deadline);
  const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  if (isPast(d) || status === 'overdue') return <span style={{ color: '#ef4444', fontSize: 12 }}>⚠️ Overdue</span>;
  if (isToday(d)) return <span style={{ color: '#f97316', fontSize: 12, fontWeight: 700 }}>⏰ Due Today!</span>;
  if (isTomorrow(d)) return <span style={{ color: '#f59e0b', fontSize: 12 }}>🔔 Tomorrow</span>;
  return <span style={{ color: days <= 3 ? '#f59e0b' : 'var(--text-muted)', fontSize: 12 }}>📅 {format(d, 'MMM d, yyyy')}</span>;
}

function TaskModal({ task, subjects, onClose, onSave }) {
  const [form, setForm] = useState(task || {
    title: '', description: '', type: 'assignment', priority: 'medium',
    status: 'todo', deadline: '', estimatedHours: 1, subject: '', tags: '', checklist: []
  });
  const [loading, setLoading] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setForm({ ...form, checklist: [...(form.checklist || []), { item: newCheckItem.trim(), completed: false }] });
    setNewCheckItem('');
  };

  const removeCheckItem = (i) => {
    setForm({ ...form, checklist: form.checklist.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.deadline) { toast.error('Title and deadline are required'); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.subject) delete payload.subject;
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3 className="modal-title">{task ? '✏️ Edit Task' : '➕ New Task'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Task Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="e.g. Complete Physics Assignment Chapter 5" required />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="form-control">
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-control">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input type="datetime-local" name="deadline" value={form.deadline ? form.deadline.slice(0, 16) : ''} onChange={handleChange} className="form-control" required />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select name="subject" value={form.subject || ''} onChange={handleChange} className="form-control">
                <option value="">No Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input type="number" name="estimatedHours" value={form.estimatedHours} onChange={handleChange} className="form-control" min="0.5" max="100" step="0.5" />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-control">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Add details about this task..." rows={3} />
            </div>

            {/* Checklist */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Checklist / Subtasks</label>
              {(form.checklist || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: 'var(--brand-success)', fontSize: 14 }}>☐</span>
                  <span style={{ flex: 1, fontSize: 14 }}>{item.item}</span>
                  <button type="button" onClick={() => removeCheckItem(i)} style={{ background: 'none', border: 'none', color: 'var(--brand-danger)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} className="form-control"
                  placeholder="Add subtask..." onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCheckItem())} />
                <button type="button" onClick={addCheckItem} className="btn btn-secondary btn-sm"><FiPlus /></button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', subject: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.subject) params.subject = filters.subject;
      const [tasksRes, subjectsRes] = await Promise.all([taskAPI.getAll(params), subjectAPI.getAll()]);
      setTasks(tasksRes.data.tasks);
      setSubjects(subjectsRes.data.subjects);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (data) => {
    if (editTask) {
      await taskAPI.update(editTask._id, data);
      toast.success('Task updated!');
    } else {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (Array.isArray(v)) formData.append(k, JSON.stringify(v));
        else if (v !== undefined && v !== null && v !== '') formData.append(k, v);
      });
      await taskAPI.create(formData);
      toast.success('Task created! +10 XP ⚡');
    }
    setEditTask(null);
    loadData();
  };

  const handleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await taskAPI.update(task._id, { status: newStatus });
    if (newStatus === 'completed') toast.success('Task completed! 🎉');
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await taskAPI.delete(id);
    toast.success('Task deleted');
    loadData();
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {
    urgent: filteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed'),
    overdue: filteredTasks.filter(t => t.status === 'overdue'),
    todo: filteredTasks.filter(t => t.status === 'todo' && t.priority !== 'urgent'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
  };

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>My Tasks</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tasks.length} total · {grouped.completed.length} completed</p>
        </div>
        <button id="create-task-btn" className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
          <FiPlus /> New Task
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar" style={{ flex: '0 0 auto', width: 280 }}>
          <FiSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ paddingLeft: 40 }} placeholder="Search tasks..." />
        </div>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="form-control" style={{ width: 130 }}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} className="form-control" style={{ width: 130 }}>
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select value={filters.subject} onChange={e => setFilters({ ...filters, subject: e.target.value })} className="form-control" style={{ width: 150 }}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
        </select>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No tasks yet</div>
            <div className="empty-state-text">Create your first task to start tracking your assignments</div>
            <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}><FiPlus /> Create Task</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(grouped).map(([group, items]) => {
              if (items.length === 0) return null;
              const labels = { urgent: '🚨 Urgent', overdue: '⚠️ Overdue', todo: '📋 To Do', 'in-progress': '🔄 In Progress', completed: '✅ Completed' };
              return (
                <div key={group}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{labels[group]}</h3>
                    <span style={{ fontSize: 12, background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}>{items.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(task => (
                      <div key={task._id} className={`task-card ${task.priority} ${task.status === 'completed' ? 'completed' : ''}`}
                        style={{ borderLeftColor: PRIORITY_COLORS[task.priority] }}>
                        <div className="task-header">
                          <button className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                            onClick={() => handleComplete(task)}>
                            {task.status === 'completed' && '✓'}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div className="task-title">{task.title}</div>
                            {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="icon-btn" onClick={() => { setEditTask(task); setShowModal(true); }}><FiEdit2 /></button>
                            <button className="icon-btn" style={{ color: 'var(--brand-danger)' }} onClick={() => handleDelete(task._id)}><FiTrash2 /></button>
                          </div>
                        </div>
                        <div className="task-meta">
                          <DeadlineLabel deadline={task.deadline} status={task.status} />
                          {task.subject && (
                            <span className="task-subject" style={{ background: `${task.subject.color}20`, color: task.subject.color }}>
                              {task.subject.icon} {task.subject.name}
                            </span>
                          )}
                          <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                          <span className={`badge badge-${task.type === 'exam' ? 'danger' : 'info'}`}>{task.type}</span>
                          {task.checklist?.length > 0 && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FiList /> {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                            </span>
                          )}
                          {task.attachments?.length > 0 && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FiPaperclip /> {task.attachments.length}
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FiClock /> {task.estimatedHours}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          subjects={subjects}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
