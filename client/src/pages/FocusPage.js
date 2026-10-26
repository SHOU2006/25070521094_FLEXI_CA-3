import React, { useState, useEffect, useRef, useCallback } from 'react';
import { focusAPI, taskAPI, subjectAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiPlay, FiPause, FiSquare, FiRefreshCw } from 'react-icons/fi';

const MODES = {
  pomodoro: { label: '🍅 Pomodoro', duration: 25, color: '#7c3aed' },
  'short-break': { label: '☕ Short Break', duration: 5, color: '#10b981' },
  'long-break': { label: '🌙 Long Break', duration: 15, color: '#06b6d4' },
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function CircularTimer({ progress, size = 240, mode }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);
  const color = MODES[mode]?.color || '#7c3aed';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

export default function FocusPage() {
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [history, setHistory] = useState({ sessions: [], chartData: [], totalMinutes: 0, totalSessions: 0 });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const totalSeconds = MODES[mode].duration * 60;
  const progress = 1 - timeLeft / totalSeconds;

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, subjectsRes, historyRes] = await Promise.all([
        taskAPI.getAll({ status: 'todo', limit: 50 }),
        subjectAPI.getAll(),
        focusAPI.getHistory({ days: 7 }),
      ]);
      setTasks(tasksRes.data.tasks);
      setSubjects(subjectsRes.data.subjects);
      setHistory(historyRes.data);
    } catch {}
    finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]); // eslint-disable-line

  // Update page title
  useEffect(() => {
    document.title = isRunning ? `${formatTime(timeLeft)} - Focus | FocusFlow` : 'Focus Timer | FocusFlow';
    return () => { document.title = 'FocusFlow'; };
  }, [timeLeft, isRunning]);

  const handleStart = async () => {
    if (!isRunning && timeLeft === totalSeconds) {
      try {
        const { data } = await focusAPI.start({
          type: mode,
          plannedDuration: MODES[mode].duration,
          taskId: selectedTask || undefined,
          subjectId: selectedSubject || undefined,
        });
        setSessionId(data.session._id);
        startTimeRef.current = Date.now();
      } catch { toast.error('Could not start session'); return; }
    }
    setIsRunning(true);
    toast.success(`${MODES[mode].label} started! 🚀`);
  };

  const handlePause = () => {
    setIsRunning(false);
    toast('Session paused ⏸️', { icon: '⏸️' });
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (sessionId) {
      try { await focusAPI.delete(sessionId); } catch {}
      setSessionId(null);
    }
    setTimeLeft(totalSeconds);
    toast('Session cancelled', { icon: '🛑' });
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    const actualDuration = MODES[mode].duration;

    if (sessionId) {
      try {
        const { data } = await focusAPI.complete(sessionId, { actualDuration });
        toast.success(`${MODES[mode].label} done! +${data.xpGained} XP ⚡`);
      } catch {}
      setSessionId(null);
    }

    if (mode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
    }

    // Play notification sound (beep)
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}

    setTimeLeft(totalSeconds);
    loadData();
  };

  const handleModeChange = (newMode) => {
    if (isRunning) { toast.error('Please stop the timer first'); return; }
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration * 60);
    setSessionId(null);
  };

  const handleReset = () => {
    if (isRunning) { toast.error('Please stop the timer first'); return; }
    setTimeLeft(totalSeconds);
  };

  const modeColor = MODES[mode].color;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Timer Section */}
        <div>
          {/* Mode Tabs */}
          <div className="timer-mode-tabs">
            {Object.entries(MODES).map(([key, val]) => (
              <button key={key} className={`timer-mode-tab ${mode === key ? 'active' : ''}`} onClick={() => handleModeChange(key)}>
                {val.label}
              </button>
            ))}
          </div>

          {/* Timer Ring */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 24 }}>
            <CircularTimer progress={progress} size={240} mode={mode} />
            <div className="timer-display">
              <div className="timer-time" style={{ color: modeColor }}>{formatTime(timeLeft)}</div>
              <div className="timer-label">{MODES[mode].label}</div>
              {completedPomodoros > 0 && (
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 4 }}>
                  {Array.from({ length: Math.min(completedPomodoros, 8) }).map((_, i) => (
                    <span key={i} style={{ fontSize: 14 }}>🍅</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="timer-controls">
            <button className="btn btn-secondary btn-icon" onClick={handleReset} title="Reset">
              <FiRefreshCw />
            </button>
            {!isRunning ? (
              <button className="btn btn-primary btn-lg" onClick={handleStart} style={{ minWidth: 120, background: `linear-gradient(135deg, ${modeColor}, ${modeColor}cc)` }}>
                <FiPlay /> {timeLeft === totalSeconds ? 'Start' : 'Resume'}
              </button>
            ) : (
              <button className="btn btn-secondary btn-lg" onClick={handlePause} style={{ minWidth: 120 }}>
                <FiPause /> Pause
              </button>
            )}
            <button className="btn btn-danger btn-icon" onClick={handleStop} title="Stop" disabled={!isRunning && !sessionId}>
              <FiSquare />
            </button>
          </div>

          {/* Task/Subject Selection */}
          <div className="card" style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📌 Session For</div>
            <div className="form-group">
              <label className="form-label">Task (optional)</label>
              <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} className="form-control">
                <option value="">No specific task</option>
                {tasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject (optional)</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="form-control">
                <option value="">No subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tips */}
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--brand-accent)' }}>
            💡 Tip: Work for 25 minutes, then take a 5-minute break. After 4 pomodoros, take a longer 15-minute break.
          </div>
        </div>

        {/* History Section */}
        <div>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Sessions', value: history.totalSessions, icon: '🍅' },
              { label: 'Focus Minutes', value: history.totalMinutes, icon: '⏱️' },
              { label: 'Hours Focused', value: (history.totalMinutes / 60).toFixed(1), icon: '🎯' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-primary-light)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Last 7 days</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          {history.chartData?.length > 0 && (
            <div className="chart-container" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>📈 Daily Focus (Minutes)</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={history.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }}
                      formatter={(v) => [`${v} min`, 'Focus']}
                    />
                    <Bar dataKey="minutes" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Session History */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>🕐 Recent Sessions</div>
            {loadingHistory ? <div className="loading-spinner"><div className="spinner" /></div> :
              history.sessions?.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>⏱️</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No sessions yet. Start your first focus session!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {history.sessions.slice(0, 10).map(s => (
                    <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: 20 }}>{s.type === 'pomodoro' ? '🍅' : s.type === 'short-break' ? '☕' : '🌙'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.task?.title || 'General Study'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {s.subject?.name && `${s.subject.name} · `}
                          {new Date(s.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary-light)' }}>{s.actualDuration}m</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{Math.floor(s.actualDuration / 5)} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
