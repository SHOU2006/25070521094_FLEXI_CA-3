const FocusSession = require('../models/FocusSession');
const User = require('../models/User');

// @desc    Start focus session
// @route   POST /api/focus/start
// @access  Private
const startSession = async (req, res) => {
  try {
    const { taskId, subjectId, type = 'pomodoro', plannedDuration = 25 } = req.body;

    const session = await FocusSession.create({
      user: req.user._id,
      task: taskId || null,
      subject: subjectId || null,
      type,
      plannedDuration,
      startedAt: new Date(),
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete focus session
// @route   PUT /api/focus/:id/complete
// @access  Private
const completeSession = async (req, res) => {
  try {
    const { actualDuration, notes } = req.body;

    const session = await FocusSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.completed = true;
    session.endedAt = new Date();
    session.actualDuration = actualDuration || session.plannedDuration;
    if (notes) session.notes = notes;
    await session.save();

    // Update user stats and XP
    const xpGain = Math.floor(session.actualDuration / 5); // 1 XP per 5 minutes
    const user = await User.findById(req.user._id);
    user.addXP(xpGain);
    user.totalFocusMinutes += session.actualDuration;

    // Focus badges
    if (user.totalFocusMinutes >= 60 && !user.badges.some(b => b.name === '1 Hour Focus')) {
      user.badges.push({ name: '1 Hour Focus', icon: '⏱️' });
    }
    if (user.totalFocusMinutes >= 600 && !user.badges.some(b => b.name === 'Deep Focus')) {
      user.badges.push({ name: 'Deep Focus', icon: '🧠' });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Session complete! +${xpGain} XP`,
      session,
      xpGained: xpGain,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get focus session history
// @route   GET /api/focus/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const sessions = await FocusSession.find({
      user: req.user._id,
      completed: true,
      startedAt: { $gte: since },
    })
      .populate('task', 'title')
      .populate('subject', 'name color')
      .sort('-startedAt')
      .limit(100);

    // Group by day for chart
    const byDay = {};
    sessions.forEach((s) => {
      const day = s.startedAt.toISOString().split('T')[0];
      if (!byDay[day]) byDay[day] = { date: day, minutes: 0, sessions: 0 };
      byDay[day].minutes += s.actualDuration;
      byDay[day].sessions += 1;
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);

    res.status(200).json({
      success: true,
      sessions,
      chartData: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      totalMinutes,
      totalSessions: sessions.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete focus session (cancel)
// @route   DELETE /api/focus/:id
// @access  Private
const deleteSession = async (req, res) => {
  try {
    await FocusSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Session cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startSession, completeSession, getHistory, deleteSession };
