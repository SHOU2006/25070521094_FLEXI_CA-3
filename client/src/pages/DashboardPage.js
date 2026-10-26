import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { FiCheckSquare, FiAlertCircle, FiClock, FiTarget, FiBook, FiTrendingUp, FiArrowRight } from 'react-icons/fi';


export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getDashboardStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const completionRate = stats?.completionRate || 0;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: <FiCheckSquare />, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: <FiTrendingUp />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: <FiAlertCircle />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { label: 'Focus (hrs)', value: ((stats?.weeklyFocusMinutes || 0) / 60).toFixed(1), icon: <FiClock />, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'Subjects', value: stats?.totalSubjects || 0, icon: <FiBook />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Active Goals', value: stats?.activeGoals || 0, icon: <FiTarget />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  ];

  const pieData = [
    { name: 'Completed', value: stats?.completedTasks || 0, color: '#10b981' },
    { name: 'Pending', value: stats?.pendingTasks || 0, color: '#7c3aed' },
    { name: 'Overdue', value: stats?.overdueTasks || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'Student'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {stats?.overdueTasks > 0
              ? `${stats.overdueTasks} overdue task${stats.overdueTasks > 1 ? 's' : ''} need attention.`
              : stats?.completionRate >= 70
              ? 'Great progress — keep the momentum going.'
              : 'Ready to have a productive session?'}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--brand-primary-light)', fontFamily: 'var(--font-display)' }}>
            {completionRate}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Completion rate</div>
          <div style={{ height: 5, width: 110, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionRate}%`, background: 'var(--brand-primary)', borderRadius: 3, transition: 'width 1s ease' }} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg }}>
              <span style={{ color: card.color, fontSize: 22 }}>{card.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Upcoming Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>
        {/* Task Distribution Chart */}
        {pieData.length > 0 && (
          <div className="chart-container">
            <div className="section-header">
              <div>
                <div className="section-title">Task Overview</div>
                <div className="section-subtitle">Assignment status breakdown</div>
              </div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        <div className="chart-container">
          <div className="section-header">
            <div>
              <div className="section-title">Upcoming Deadlines</div>
              <div className="section-subtitle">Next 7 days</div>
            </div>
            <Link to="/tasks" className="btn btn-ghost btn-sm">
              View All <FiArrowRight />
            </Link>
          </div>

          {!stats?.upcomingDeadlines?.length ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 13 }}>No upcoming deadlines</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.upcomingDeadlines.map(task => {
                const days = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task._id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${days <= 1 ? 'rgba(239,68,68,0.3)' : days <= 3 ? 'rgba(245,158,11,0.3)' : 'var(--border-light)'}`,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.subject?.color || '#7c3aed', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, truncate: 'true', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {task.subject?.icon} {task.subject?.name || 'No Subject'}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: days <= 1 ? '#ef4444' : days <= 3 ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }}>
                      {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days}d left`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/tasks" className="btn btn-primary"><FiCheckSquare /> New Task</Link>
          <Link to="/focus" className="btn btn-secondary"><FiClock /> Start Focus</Link>
          <Link to="/subjects" className="btn btn-secondary"><FiBook /> Add Subject</Link>
          <Link to="/goals" className="btn btn-secondary"><FiTarget /> Set a Goal</Link>
        </div>
      </div>
    </div>
  );
}
