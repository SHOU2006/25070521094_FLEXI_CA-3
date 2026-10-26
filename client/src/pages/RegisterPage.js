import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password);
      toast.success(data.message || 'Account created! Welcome to FocusFlow!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return null;
    if (p.length < 6) return { label: 'Weak', color: '#ef4444', width: '30%' };
    if (p.length < 10) return { label: 'Fair', color: '#f59e0b', width: '60%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };

  const strength = passwordStrength();

  return (
    <div className="auth-page" data-theme="dark">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        <div className="auth-logo">
          <h1 className="auth-title">FocusFlow</h1>
          <p className="auth-subtitle">Start your productive journey today</p>
        </div>

        {/* Welcome perks */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['+50 XP on signup', 'Streak tracking', 'Badges & levels'].map(perk => (
            <span key={perk} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(139,124,248,0.1)', border: '1px solid rgba(139,124,248,0.18)', borderRadius: 'var(--radius-full)', color: 'var(--brand-primary-light)', fontWeight: 600 }}>
              {perk}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }} />
              <input type="text" name="name" id="reg-name" value={form.name} onChange={handleChange}
                className="form-control" style={{ paddingLeft: 40 }} placeholder="Your full name" autoComplete="name" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }} />
              <input type="email" name="email" id="reg-email" value={form.email} onChange={handleChange}
                className="form-control" style={{ paddingLeft: 40 }} placeholder="student@university.edu" autoComplete="email" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }} />
              <input
                type={showPassword ? 'text' : 'password'} name="password" id="reg-password"
                value={form.password} onChange={handleChange} className="form-control"
                style={{ paddingLeft: 40, paddingRight: 40 }} placeholder="Min. 6 characters" autoComplete="new-password" required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {strength && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 2, transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label} password</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }} />
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" id="reg-confirm-password"
                value={form.confirmPassword} onChange={handleChange} className="form-control"
                style={{ paddingLeft: 40, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? 'var(--brand-danger)' : undefined }}
                placeholder="Confirm password" autoComplete="new-password" required />
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="form-error">Passwords do not match</p>
            )}
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</>
            ) : (
              <><FiUserPlus /> Create Account</>
            )}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
