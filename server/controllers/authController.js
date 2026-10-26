const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.',
      });
    }

    const user = await User.create({ name, email, password });

    // Award welcome badge
    user.badges.push({ name: 'Welcome', icon: '🎉' });
    user.xp = 50;
    user.lastActiveDate = new Date();
    user.streak = 1;
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to FLEXI!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        theme: user.theme,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update streak on login
    user.updateStreak();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        theme: user.theme,
        avatar: user.avatar,
        totalTasksCompleted: user.totalTasksCompleted,
        totalFocusMinutes: user.totalFocusMinutes,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, theme, emailReminders } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (theme) updateData.theme = theme;
    if (emailReminders !== undefined) updateData.emailReminders = emailReminders;

    if (req.file) {
      updateData.avatar = `/uploads/${req.user._id}/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res
        .status(401)
        .json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/auth/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const Task = require('../models/Task');
    const Subject = require('../models/Subject');
    const StudyGoal = require('../models/StudyGoal');
    const FocusSession = require('../models/FocusSession');

    const userId = req.user._id;
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingDeadlines,
      totalSubjects,
      activeGoals,
      weeklyFocusSessions,
    ] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.countDocuments({ user: userId, status: 'overdue' }),
      Task.find({
        user: userId,
        status: { $ne: 'completed' },
        deadline: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      })
        .populate('subject', 'name color icon')
        .sort('deadline')
        .limit(5),
      Subject.countDocuments({ user: userId, isActive: true }),
      StudyGoal.countDocuments({ user: userId, status: 'active' }),
      FocusSession.find({
        user: userId,
        completed: true,
        startedAt: { $gte: weekStart },
      }),
    ]);

    const weeklyFocusMinutes = weeklyFocusSessions.reduce(
      (sum, s) => sum + (s.actualDuration || 0),
      0
    );

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        overdueTasks,
        pendingTasks: totalTasks - completedTasks - overdueTasks,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalSubjects,
        activeGoals,
        weeklyFocusMinutes,
        weeklyFocusSessions: weeklyFocusSessions.length,
        upcomingDeadlines,
        user: {
          xp: req.user.xp,
          level: req.user.level,
          streak: req.user.streak,
          badges: req.user.badges,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, getDashboardStats };
