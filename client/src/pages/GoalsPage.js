import React, { useState, useEffect, useCallback } from 'react';
import { goalAPI, subjectAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiCalendar } from 'react-icons/fi';
import { format, isPast } from 'date-fns';

const CATEGORIES = ['academic', 'skill', 'personal', 'career', 'other'];
const CATEGORY_ICONS = { academic: '🎓', skill: '💡', personal: '🌟', career: '💼', other: '📌' };

function GoalModal({ goal, subjects, onClose, onSave }) {
  const [form, setForm] = useState(goal || { title: '', description: '', category: 'academic', targetDate: '', progress: 0, linkedSubject: '', milestones: [] });
  const [loading, setLoading] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setForm({ ...form, milestones: [...(form.milestones || []), { title: newMilestone.trim(), completed: false }] });
    setNewMilestone('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.targetDate) { toast.error('Title and target date required'); return; }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving goal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{goal ? '✏️ Edit Goal' : '🎯 New Study Goal'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="form-control" placeholder="e.g. Score 9.5 GPA this semester" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-control">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Date *</label>
              <input type="date" value={form.targetDate ? form.targetDate.slice(0, 10) : ''} onChange={e => setForm({ ...form, targetDate: e.target.value })} className="form-control" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Linked Subject (optional)</label>
            <select value={form.linkedSubject || ''} onChange={e => setForm({ ...form, linkedSubject: e.target.value })} className="form-control">
              <option value="">None</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-control" placeholder="What do you want to achieve?" rows={2} />
          </div>

          {/* Milestones */}
          <div className="form-group">
            <label className="form-label">Milestones</label>
            {(form.milestones || []).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 14 }}>🏁</span>
                <span style={{ flex: 1, fontSize: 14 }}>{m.title}</span>
                <button type="button" onClick={() => setForm({ ...form, milestones: form.milestones.filter((_, idx) => idx !== i) })}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-danger)', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input value={newMilestone} onChange={e => setNewMilestone(e.target.value)} className="form-control"
                placeholder="Add milestone..." onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addMilestone())} />
              <button type="button" onClick={addMilestone} className="btn btn-secondary btn-sm"><FiPlus /></button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [filter, setFilter] = useState('active');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, subjectsRes] = await Promise.all([goalAPI.getAll(), subjectAPI.getAll()]);
      setGoals(goalsRes.data.goals);
      setSubjects(subjectsRes.data.subjects);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (data) => {
    if (editGoal) { await goalAPI.update(editGoal._id, data); toast.success('Goal updated!'); }
    else { await goalAPI.create(data); toast.success('Goal created! 🎯'); }
    setEditGoal(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await goalAPI.delete(id);
    toast.success('Goal deleted');
    loadData();
  };

  const handleToggleMilestone = async (goalId, milestoneId) => {
    await goalAPI.toggleMilestone(goalId, milestoneId);
    loadData();
  };

  const handleUpdateProgress = async (goal, progress) => {
    await goalAPI.update(goal._id, { progress: parseInt(progress) });
    loadData();
  };

  const filtered = goals.filter(g => filter === 'all' || g.status === filter);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Study Goals</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{goals.filter(g => g.status === 'active').length} active goals</p>
        </div>
        <button id="add-goal-btn" className="btn btn-primary" onClick={() => { setEditGoal(null); setShowModal(true); }}>
          <FiPlus /> New Goal
        </button>
      </div>

      <div className="filter-bar">
        {['all', 'active', 'completed', 'paused'].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-title">No goals yet</div>
            <div className="empty-state-text">Set meaningful study goals to stay motivated and track your progress</div>
            <button className="btn btn-primary" onClick={() => { setEditGoal(null); setShowModal(true); }}><FiPlus /> Create Goal</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filtered.map(goal => {
              const isExpired = isPast(new Date(goal.targetDate)) && goal.status !== 'completed';
              return (
                <div key={goal._id} className="goal-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{CATEGORY_ICONS[goal.category]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{goal.title}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className={`badge badge-${goal.status === 'completed' ? 'success' : goal.status === 'active' ? 'primary' : 'warning'}`}>{goal.status}</span>
                        <span className="badge badge-info">{goal.category}</span>
                        {isExpired && <span className="badge badge-danger">Expired</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => { setEditGoal(goal); setShowModal(true); }}><FiEdit2 /></button>
                      <button className="icon-btn" style={{ color: 'var(--brand-danger)' }} onClick={() => handleDelete(goal._id)}><FiTrash2 /></button>
                    </div>
                  </div>

                  {goal.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{goal.description}</p>}

                  {/* Target Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isExpired ? 'var(--brand-danger)' : 'var(--text-muted)', marginBottom: 12 }}>
                    <FiCalendar />
                    Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                    {goal.linkedSubject && <span style={{ marginLeft: 8 }}>{goal.linkedSubject.icon} {goal.linkedSubject.name}</span>}
                  </div>

                  {/* Progress */}
                  <div className="goal-progress-label">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Progress</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand-primary-light)' }}>{goal.progress}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 8 }}>
                    <div className="progress-fill" style={{ width: `${goal.progress}%`, background: goal.progress === 100 ? 'var(--gradient-success)' : 'var(--gradient-primary)' }} />
                  </div>

                  {/* Manual progress slider */}
                  {goal.milestones?.length === 0 && (
                    <input type="range" min={0} max={100} value={goal.progress}
                      onChange={e => handleUpdateProgress(goal, e.target.value)}
                      style={{ width: '100%', marginBottom: 12, accentColor: 'var(--brand-primary)' }} />
                  )}

                  {/* Milestones */}
                  {goal.milestones?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})
                      </div>
                      {goal.milestones.map(m => (
                        <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                          <button onClick={() => handleToggleMilestone(goal._id, m._id)}
                            style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${m.completed ? '#10b981' : 'var(--border-color)'}`, background: m.completed ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 11, flexShrink: 0 }}>
                            {m.completed && <FiCheck />}
                          </button>
                          <span style={{ fontSize: 13, textDecoration: m.completed ? 'line-through' : 'none', color: m.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {showModal && <GoalModal goal={editGoal} subjects={subjects} onClose={() => { setShowModal(false); setEditGoal(null); }} onSave={handleSave} />}
    </div>
  );
}
