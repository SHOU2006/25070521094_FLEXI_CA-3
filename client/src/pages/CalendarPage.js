import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PRIORITY_COLORS = { urgent: '#ef4444', high: '#f59e0b', medium: '#06b6d4', low: '#10b981' };

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskAPI.getAll({ limit: 200 })
      .then(({ data }) => setTasks(data.tasks))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad with empty days for correct grid alignment
  const startDayOfWeek = monthStart.getDay();
  const paddedDays = [...Array(startDayOfWeek).fill(null), ...days];

  const getTasksForDay = (day) => {
    if (!day) return [];
    return tasks.filter(t => {
      const d = new Date(t.deadline);
      return isSameDay(d, day);
    });
  };

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
      {/* Calendar */}
      <div className="card">
        {/* Month Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button className="icon-btn" onClick={prevMonth}><FiChevronLeft /></button>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{format(currentDate, 'MMMM yyyy')}</h2>
          <button className="icon-btn" onClick={nextMonth}><FiChevronRight /></button>
        </div>

        {/* Week Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {WEEK_DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? <div className="loading-spinner" style={{ padding: 40 }}><div className="spinner" /></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dayTasks = getTasksForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay) ? null : day)}
                  style={{
                    aspectRatio: 1,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: 6,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(124,58,237,0.2)' : isToday(day) ? 'rgba(124,58,237,0.1)' : 'transparent',
                    border: isSelected ? '2px solid var(--brand-primary)' : isToday(day) ? '1px solid var(--brand-primary)' : '1px solid transparent',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.background = isToday(day) ? 'rgba(124,58,237,0.1)' : 'transparent')}
                >
                  <span style={{
                    fontSize: 13,
                    fontWeight: isToday(day) ? 800 : 500,
                    color: isToday(day) ? 'var(--brand-primary-light)' : !isSameMonth(day, currentDate) ? 'var(--text-muted)' : 'var(--text-primary)',
                  }}>
                    {format(day, 'd')}
                  </span>

                  {dayTasks.length > 0 && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dayTasks.slice(0, 3).map((t, ti) => (
                        <div key={ti} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: PRIORITY_COLORS[t.priority] || '#7c3aed'
                        }} />
                      ))}
                      {dayTasks.length > 3 && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{dayTasks.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          {Object.entries(PRIORITY_COLORS).map(([p, c]) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day Detail */}
      <div>
        {selectedDay ? (
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{format(selectedDay, 'EEEE')}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>{format(selectedDay, 'MMMM d, yyyy')}</div>

            {selectedDayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <p style={{ fontSize: 13 }}>No tasks due on this day!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedDayTasks.map(t => (
                  <div key={t._id} style={{
                    padding: '12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    borderLeft: `4px solid ${PRIORITY_COLORS[t.priority]}`,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className={`badge priority-${t.priority}`}>{t.priority}</span>
                      <span className={`badge status-${t.status}`}>{t.status}</span>
                    </div>
                    {t.subject && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {t.subject.icon} {t.subject.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Select a Day</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click on any date to see tasks due that day</div>
          </div>
        )}

        {/* Upcoming tasks this month */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>📋 This Month</div>
          <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks
              .filter(t => {
                const d = new Date(t.deadline);
                return d >= monthStart && d <= monthEnd && t.status !== 'completed';
              })
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 8)
              .map(t => (
                <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[t.priority], flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{format(new Date(t.deadline), 'MMM d')}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
