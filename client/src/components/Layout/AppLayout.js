import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiGrid, FiCheckSquare, FiBook, FiTarget, FiClock,
  FiUsers, FiCalendar, FiUser, FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiZap, FiTrendingUp
} from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
  { path: '/tasks', icon: <FiCheckSquare />, label: 'Tasks' },
  { path: '/subjects', icon: <FiBook />, label: 'Subjects' },
  { path: '/goals', icon: <FiTarget />, label: 'Goals' },
  { path: '/focus', icon: <FiClock />, label: 'Focus Timer' },
  { path: '/groups', icon: <FiUsers />, label: 'Study Groups' },
  { path: '/calendar', icon: <FiCalendar />, label: 'Calendar' },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'My Tasks',
  '/subjects': 'Subjects',
  '/goals': 'Study Goals',
  '/focus': 'Focus Timer',
  '/groups': 'Study Groups',
  '/calendar': 'Calendar',
  '/profile': 'Profile',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || 'FocusFlow';
  const xpPercent = Math.min(((user?.xp || 0) % 500) / 500 * 100, 100);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'FL';

  return (
    <div className="app-layout">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          {!collapsed && <span className="logo-text">FocusFlow</span>}
          <button
            className="icon-btn"
            style={{ marginLeft: collapsed ? 'auto' : 'auto' }}
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
          >
            {collapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>

        {/* Streak Banner */}
        {!collapsed && user?.streak > 0 && (
          <div style={{ margin: '8px 12px', padding: '7px 12px', background: 'rgba(249,115,22,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiTrendingUp size={14} style={{ color: '#f97316', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>{user.streak}-day streak</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            {!collapsed && <div className="nav-section-label">Main Menu</div>}
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>

          <div className="nav-section" style={{ marginTop: 8 }}>
            {!collapsed && <div className="nav-section-label">Account</div>}
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon"><FiUser /></span>
              {!collapsed && <span>Profile</span>}
            </NavLink>
            <button className="nav-item" onClick={logout} style={{ color: 'var(--brand-danger)' }}>
              <span className="nav-icon"><FiLogOut /></span>
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>

        {/* User Info */}
        {!collapsed && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={`http://localhost:5000${user.avatar}`} alt={user.name} />
              ) : initials}
            </div>
            <div className="user-info">
              <div className="user-name truncate">{user?.name || 'Student'}</div>
              <div className="user-level">Level {user?.level || 1} · {user?.xp || 0} XP</div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <button
            className="icon-btn"
            style={{ display: 'none' }}
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
          >
            <FiMenu />
          </button>

          <h1 className="topbar-title">{pageTitle}</h1>

          <div className="topbar-actions">
            {/* XP Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
              <FiZap style={{ color: 'var(--brand-primary-light)', fontSize: 13 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{user?.xp || 0} XP</span>
            </div>

            {/* Theme Toggle */}
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
