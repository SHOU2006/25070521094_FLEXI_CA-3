import React, { useState, useEffect, useCallback, useRef } from 'react';
import { subjectAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiStar, FiFileText,
  FiX, FiPaperclip, FiDownload, FiBookOpen
} from 'react-icons/fi';

const SUBJECT_COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#f97316','#ec4899','#14b8a6','#6366f1'];
const SUBJECT_ICONS = ['📚','🔬','🧮','🌍','💻','🎨','📖','⚗️','🏛️','📐','🎵','⚙️','🌱','🔭','📊'];

function SubjectModal({ subject, onClose, onSave }) {
  const [form, setForm] = useState(subject || { name: '', code: '', professor: '', credits: 3, color: '#7c3aed', icon: '📚', targetGPA: 9.0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Subject name is required'); return; }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving subject');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{subject ? 'Edit Subject' : 'Add Subject'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-control" placeholder="e.g. Data Structures & Algorithms" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input name="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="form-control" placeholder="CS301" />
            </div>
            <div className="form-group">
              <label className="form-label">Credits</label>
              <input type="number" name="credits" value={form.credits} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} className="form-control" min={1} max={10} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Professor</label>
            <input name="professor" value={form.professor} onChange={e => setForm({ ...form, professor: e.target.value })} className="form-control" placeholder="Prof. Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Target GPA</label>
            <input type="number" name="targetGPA" value={form.targetGPA} onChange={e => setForm({ ...form, targetGPA: Number(e.target.value) })} className="form-control" min={0} max={10} step={0.5} />
          </div>

          {/* Color Picker */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUBJECT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer', outline: 'none' }} />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUBJECT_ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                  style={{ width: 36, height: 36, borderRadius: 8, border: form.icon === icon ? `2px solid ${form.color}` : '2px solid var(--border-light)', background: form.icon === icon ? `${form.color}20` : 'var(--bg-tertiary)', cursor: 'pointer', fontSize: 18 }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : subject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GradeModal({ subjectId, onClose, onSave }) {
  const [form, setForm] = useState({ assessmentName: '', score: '', totalScore: 100, weight: 10 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(subjectId, form);
      onClose();
    } catch (err) {
      toast.error('Error adding grade');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Add Grade</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Assessment Name *</label>
            <input value={form.assessmentName} onChange={e => setForm({ ...form, assessmentName: e.target.value })} className="form-control" placeholder="e.g. Mid-term Exam" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Score *</label>
              <input type="number" value={form.score} onChange={e => setForm({ ...form, score: Number(e.target.value) })} className="form-control" min={0} required />
            </div>
            <div className="form-group">
              <label className="form-label">Out of</label>
              <input type="number" value={form.totalScore} onChange={e => setForm({ ...form, totalScore: Number(e.target.value) })} className="form-control" min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (%)</label>
              <input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} className="form-control" min={1} max={100} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Add Grade</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Notes Drawer ────────────────────────────────────────────────────────────
function NotesDrawer({ subject, onClose, onUpdate }) {
  const [notes, setNotes] = useState(subject?.notes || []);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef();

  // Keep notes in sync if parent subject changes
  useEffect(() => { setNotes(subject?.notes || []); }, [subject]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Note title is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('content', form.content);
      files.forEach(f => fd.append('attachments', f));
      const { data } = await subjectAPI.addNote(subject._id, fd);
      setNotes(data.subject.notes);
      onUpdate(data.subject);
      setForm({ title: '', content: '' });
      setFiles([]);
      setAdding(false);
      toast.success('Note added! 📝');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally { setSaving(false); }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    setDeletingId(noteId);
    try {
      const { data } = await subjectAPI.deleteNote(subject._id, noteId);
      setNotes(data.subject.notes);
      onUpdate(data.subject);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    } finally { setDeletingId(null); }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimetype) => {
    if (!mimetype) return '📎';
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📑';
    if (mimetype === 'text/plain') return '📃';
    return '📎';
  };

  return (
    <>
      {/* Backdrop */}
      <div className="notes-drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="notes-drawer">
        {/* Header */}
        <div className="notes-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: `${subject.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>{subject.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{subject.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!adding && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setAdding(true)}
                id="add-note-btn"
              >
                <FiPlus /> Add Note
              </button>
            )}
            <button className="icon-btn" onClick={onClose}><FiX /></button>
          </div>
        </div>

        {/* Add Note Form */}
        {adding && (
          <div className="notes-add-form">
            <form onSubmit={handleAddNote}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-control"
                  placeholder="e.g. Chapter 3 Summary"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  placeholder="Write your note here..."
                  rows={4}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  style={{ resize: 'vertical', minHeight: 80 }}
                />
              </div>

              {/* File Attachments */}
              <div className="form-group">
                <label className="form-label">Attachments (up to 5)</label>
                <div
                  className="notes-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiPaperclip style={{ fontSize: 20, color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to attach files</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PDF, Word, Excel, Images, Text (max 10MB each)</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const selected = Array.from(e.target.files).slice(0, 5);
                    setFiles(selected);
                  }}
                />
                {files.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {files.map((f, i) => (
                      <div key={i} className="notes-attachment-chip">
                        <span>{getFileIcon(f.type)}</span>
                        <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{formatFileSize(f.size)}</span>
                        <button type="button" className="icon-btn" style={{ fontSize: 12, padding: 2 }}
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setAdding(false); setForm({ title: '', content: '' }); setFiles([]); }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="notes-empty">
              <FiBookOpen style={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: 12 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No notes yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add your first note using the button above</div>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="note-card">
                <div className="note-card-header">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1, minWidth: 0 }}>
                    <FiFileText style={{ color: subject.color, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{note.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <button
                    className="icon-btn"
                    style={{ color: 'var(--brand-danger)', flexShrink: 0 }}
                    onClick={() => handleDeleteNote(note._id)}
                    disabled={deletingId === note._id}
                  >
                    {deletingId === note._id ? '...' : <FiTrash2 />}
                  </button>
                </div>

                {note.content && (
                  <div className="note-content">{note.content}</div>
                )}

                {note.attachments?.length > 0 && (
                  <div className="note-attachments">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {note.attachments.length} attachment{note.attachments.length !== 1 ? 's' : ''}
                  </div>
                    {note.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={`http://localhost:5000${att.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="notes-attachment-chip"
                        style={{ textDecoration: 'none', cursor: 'pointer' }}
                      >
                        <span>{getFileIcon(att.mimetype)}</span>
                        <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {att.filename}
                        </span>
                        {att.size && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{formatFileSize(att.size)}</span>
                        )}
                        <FiDownload style={{ flexShrink: 0, color: 'var(--text-muted)', fontSize: 13 }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(null);
  const [notesPanel, setNotesPanel] = useState(null); // subject for which notes drawer is open

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await subjectAPI.getAll();
      setSubjects(data.subjects);
    } catch { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const handleSave = async (data) => {
    if (editSubject) { await subjectAPI.update(editSubject._id, data); toast.success('Subject updated!'); }
    else { await subjectAPI.create(data); toast.success('Subject added!'); }
    setEditSubject(null);
    loadSubjects();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subject?')) return;
    await subjectAPI.delete(id);
    toast.success('Subject removed');
    loadSubjects();
  };

  const handleAddGrade = async (id, data) => {
    await subjectAPI.addGrade(id, data);
    toast.success('Grade added!');
    loadSubjects();
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Subjects</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subjects.length} subjects enrolled</p>
        </div>
        <button id="add-subject-btn" className="btn btn-primary" onClick={() => { setEditSubject(null); setShowModal(true); }}>
          <FiPlus /> Add Subject
        </button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">No subjects yet</div>
            <div className="empty-state-text">Add your subjects to organize tasks and track grades</div>
            <button className="btn btn-primary" onClick={() => { setEditSubject(null); setShowModal(true); }}><FiPlus /> Add Subject</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {subjects.map(subject => {
              const percentage = subject.currentGPA ? ((subject.currentGPA / 10) * 100) : 0;
              return (
                <div key={subject._id} className="card" style={{ borderTop: `4px solid ${subject.color}` }}>
                  {/* Subject Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${subject.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {subject.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{subject.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {subject.code && <span style={{ marginRight: 8 }}>#{subject.code}</span>}
                        {subject.credits} credits
                        {subject.professor && <span> · {subject.professor}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => { setEditSubject(subject); setShowModal(true); }}><FiEdit2 /></button>
                      <button className="icon-btn" style={{ color: 'var(--brand-danger)' }} onClick={() => handleDelete(subject._id)}><FiTrash2 /></button>
                    </div>
                  </div>

                  {/* GPA Section */}
                  <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>GPA Progress</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: subject.color }}>
                        {subject.currentGPA || '—'} / {subject.targetGPA}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(percentage, 100)}%`, background: subject.color }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{subject.grades?.length || 0} assessments recorded</div>
                  </div>

                  {/* Recent Grades */}
                  {subject.grades?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Recent Grades</div>
                      {subject.grades.slice(-3).map((g, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--border-light)', fontSize: 12 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{g.assessmentName}</span>
                          <span style={{ fontWeight: 700, color: (g.score / g.totalScore) >= 0.7 ? '#10b981' : (g.score / g.totalScore) >= 0.5 ? '#f59e0b' : '#ef4444' }}>
                            {g.score}/{g.totalScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setShowGradeModal(subject._id)}>
                      <FiStar /> Add Grade
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1, position: 'relative' }}
                      onClick={() => setNotesPanel(subject)}
                    >
                      <FiFileText /> Notes
                      {subject.notes?.length > 0 && (
                        <span style={{
                          position: 'absolute', top: -6, right: -6,
                          background: 'var(--brand-primary)', color: '#fff',
                          borderRadius: '50%', width: 18, height: 18,
                          fontSize: 10, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{subject.notes.length}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showModal && <SubjectModal subject={editSubject} onClose={() => { setShowModal(false); setEditSubject(null); }} onSave={handleSave} />}
      {showGradeModal && <GradeModal subjectId={showGradeModal} onClose={() => setShowGradeModal(null)} onSave={handleAddGrade} />}

      {/* Notes Drawer */}
      {notesPanel && (
        <NotesDrawer
          subject={notesPanel}
          onClose={() => setNotesPanel(null)}
          onUpdate={(updatedSubject) => {
            // Sync updated notes count into subjects list & notesPanel state
            setSubjects(prev => prev.map(s => s._id === updatedSubject._id ? { ...s, notes: updatedSubject.notes } : s));
            setNotesPanel(prev => prev ? { ...prev, notes: updatedSubject.notes } : null);
          }}
        />
      )}
    </div>
  );
}
