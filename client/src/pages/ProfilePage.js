import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiLock, FiSun, FiMoon, FiUpload, FiZap, FiStar } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', emailReminders: user?.emailReminders !== false });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('emailReminders', profileForm.emailReminders);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await authAPI.updateProfile(formData);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoadingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoadingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally { setLoadingPassword(false); }
  };

  const xpForCurrentLevel = (user?.level - 1) * 500;
  const xpProgress = (user?.xp || 0) - xpForCurrentLevel;
  const xpPercent = Math.min((xpProgress / 500) * 100, 100);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FL';



  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Profile Card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', overflow: 'hidden', border: '3px solid rgba(124,58,237,0.4)' }}>
                {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                  user?.avatar ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                <FiUpload style={{ fontSize: 12, color: 'white' }} />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(124,58,237,0.1)', borderRadius: 'var(--radius-full)' }}>
                  <FiZap style={{ color: 'var(--brand-primary-light)', fontSize: 13 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-primary-light)' }}>Level {user?.level}</span>
                </div>
                {user?.streak > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(249,115,22,0.1)', borderRadius: 'var(--radius-full)' }}>
                    <span>🔥</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316' }}>{user.streak} Day Streak</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-full)' }}>
                  <FiStar style={{ color: '#10b981', fontSize: 13 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{user?.totalTasksCompleted || 0} Tasks Done</span>
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div style={{ textAlign: 'center', minWidth: 140 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>XP Progress</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-primary-light)', marginBottom: 4 }}>{user?.xp || 0}</div>
              <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${xpPercent}%`, background: 'var(--gradient-primary)', borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{xpProgress}/500 XP to Level {(user?.level || 1) + 1}</div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}><FiUser style={{ marginRight: 8 }} />Edit Profile</div>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="form-control" placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Reminders</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="email-reminders" checked={profileForm.emailReminders} onChange={e => setProfileForm({ ...profileForm, emailReminders: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }} />
                <label htmlFor="email-reminders" style={{ fontSize: 14, cursor: 'pointer' }}>Receive email reminders for deadlines</label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Theme</label>
              <button type="button" onClick={toggleTheme} className="btn btn-secondary w-full">
                {theme === 'dark' ? <><FiSun /> Switch to Light Mode</> : <><FiMoon /> Switch to Dark Mode</>}
              </button>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loadingProfile}>
              {loadingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}><FiLock style={{ marginRight: 8 }} />Change Password</div>
          <form onSubmit={handlePasswordSave}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="form-control" placeholder="Current password" required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="form-control" placeholder="New password (min. 6 chars)" required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="form-control"
                style={{ borderColor: passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'var(--brand-danger)' : undefined }}
                placeholder="Confirm new password" required />
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && <p className="form-error">Passwords do not match</p>}
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loadingPassword}>
              {loadingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Badges */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-title" style={{ marginBottom: 16 }}>🏆 My Badges</div>
          {(!user?.badges || user.badges.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Complete tasks and maintain streaks to earn badges!</p>
          ) : (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {user.badges.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: 24 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(b.earnedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Locked Badges Preview */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>🔒 Badges to Unlock</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { name: 'Task Master', icon: '🏆', hint: 'Complete 10 tasks' },
                { name: 'Productivity Pro', icon: '⚡', hint: 'Complete 50 tasks' },
                { name: 'Week Streak', icon: '🔥', hint: 'Maintain 7-day streak' },
                { name: '1 Hour Focus', icon: '⏱️', hint: 'Focus for 60+ minutes' },
                { name: 'Deep Focus', icon: '🧠', hint: 'Focus for 600+ minutes' },
              ].filter(b => !user?.badges?.some(ub => ub.name === b.name)).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', opacity: 0.6 }}>
                  <span style={{ fontSize: 20, filter: 'grayscale(1)' }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-title" style={{ marginBottom: 16 }}>📊 My Statistics</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Total XP', value: user?.xp || 0, icon: '⚡', color: '#7c3aed' },
              { label: 'Current Level', value: user?.level || 1, icon: '🎯', color: '#06b6d4' },
              { label: 'Tasks Done', value: user?.totalTasksCompleted || 0, icon: '✅', color: '#10b981' },
              { label: 'Focus (mins)', value: user?.totalFocusMinutes || 0, icon: '⏱️', color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
