import React, { useState, useEffect, useCallback } from 'react';
import { groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiUsers, FiLogOut, FiLink, FiSend } from 'react-icons/fi';

function GroupModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', subject: '', maxMembers: 20, isPublic: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error creating group'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">👥 Create Study Group</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Group Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-control" placeholder="e.g. CS301 Study Gang" required />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="form-control" placeholder="e.g. Data Structures" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-control" placeholder="What is this group about?" rows={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Members</label>
            <input type="number" value={form.maxMembers} onChange={e => setForm({ ...form, maxMembers: parseInt(e.target.value) })} className="form-control" min={2} max={100} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="isPublic" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }} />
            <label htmlFor="isPublic" style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>Make group public (discoverable)</label>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Group'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JoinModal({ onClose, onJoin }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { toast.error('Enter an invite code'); return; }
    setLoading(true);
    try { await onJoin(code.trim().toUpperCase()); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || 'Invalid invite code'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h3 className="modal-title">🔗 Join a Group</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Invite Code</label>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="form-control"
              placeholder="e.g. AB12CD" maxLength={10} style={{ letterSpacing: '0.2em', fontSize: 18, textAlign: 'center', fontWeight: 700 }} required />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Joining...' : 'Join Group'}</button>
        </form>
      </div>
    </div>
  );
}

function GroupDetail({ group, currentUser, onLeave, onAnnounce, onBack }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars

  const handleAnnounce = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      await onAnnounce(group._id, message);
      setMessage('');
      toast.success('Posted!');
    } catch { toast.error('Error posting'); }
    finally { setLoading(false); }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    toast.success('Invite code copied!');
  };

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Groups</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Main */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👥</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{group.name}</h2>
                {group.subject && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>📖 {group.subject}</div>}
                {group.description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>{group.description}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} onClick={copyInviteCode}>
                <FiLink />
                <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', fontSize: 15 }}>{group.inviteCode}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Copy Code</span>
              </div>
              <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                <FiUsers /> {group.members?.length}/{group.maxMembers} members
              </span>
            </div>
          </div>

          {/* Announcements */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>📢 Announcements</div>
            <form onSubmit={handleAnnounce} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input value={message} onChange={e => setMessage(e.target.value)} className="form-control" placeholder="Post an announcement or message..." />
              <button type="submit" className="btn btn-primary btn-icon" disabled={loading}><FiSend /></button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
              {(!group.announcements || group.announcements.length === 0) && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>No announcements yet. Be the first to post!</div>
              )}
              {[...(group.announcements || [])].reverse().map((a, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                      {a.author?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{a.author?.name || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 14, paddingLeft: 36 }}>{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Members Sidebar */}
        <div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>👤 Members ({group.members?.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {group.members?.map(m => (
                <div key={m.user?._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 'var(--radius-md)', background: m.user?._id === currentUser?._id ? 'rgba(124,58,237,0.1)' : 'var(--bg-tertiary)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0 }}>
                    {m.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.user?.name || 'Unknown'} {m.user?._id === currentUser?._id && '(You)'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>⚡ {m.user?.xp || 0} XP · Lv.{m.user?.level || 1}</div>
                  </div>
                  {m.role === 'admin' && <span className="badge badge-primary" style={{ fontSize: 10 }}>Admin</span>}
                </div>
              ))}
            </div>
            <button className="btn btn-danger btn-sm w-full" style={{ marginTop: 16 }} onClick={() => onLeave(group._id)}>
              <FiLogOut /> Leave Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await groupAPI.getAll();
      setGroups(data.groups);
    } catch { toast.error('Failed to load groups'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const handleCreate = async (data) => {
    await groupAPI.create(data);
    toast.success('Study group created! 🎉');
    loadGroups();
  };

  const handleJoin = async (code) => {
    await groupAPI.join(code);
    toast.success('Joined group! 🎉');
    loadGroups();
  };

  const handleLeave = async (id) => {
    if (!window.confirm('Leave this group?')) return;
    await groupAPI.leave(id);
    toast.success('Left group');
    setSelectedGroup(null);
    loadGroups();
  };

  const handleAnnounce = async (id, message) => {
    const { data } = await groupAPI.announce(id, message);
    setSelectedGroup(data.group);
    loadGroups();
  };

  const openGroup = async (id) => {
    try {
      const { data } = await groupAPI.getById(id);
      setSelectedGroup(data.group);
    } catch { toast.error('Could not load group'); }
  };

  if (selectedGroup) {
    return <GroupDetail group={selectedGroup} currentUser={user} onLeave={handleLeave} onAnnounce={handleAnnounce} onBack={() => setSelectedGroup(null)} />;
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Study Groups</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Collaborate and study together</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowJoin(true)}><FiLink /> Join with Code</button>
          <button id="create-group-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}><FiPlus /> Create Group</button>
        </div>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No study groups yet</div>
            <div className="empty-state-text">Create a group or join one with an invite code to start collaborating</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}><FiPlus /> Create Group</button>
              <button className="btn btn-secondary" onClick={() => setShowJoin(true)}><FiLink /> Join with Code</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {groups.map(g => (
              <div key={g._id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => openGroup(g._id)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👥</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                    {g.subject && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📖 {g.subject}</div>}
                  </div>
                </div>
                {g.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{g.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiUsers /> {g.members?.length}/{g.maxMembers}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {g.members?.slice(0, 4).map((m, i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', marginLeft: i > 0 ? -8 : 0, border: '2px solid var(--bg-card)' }}>
                        {m.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showCreate && <GroupModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {showJoin && <JoinModal onClose={() => setShowJoin(false)} onJoin={handleJoin} />}
    </div>
  );
}
