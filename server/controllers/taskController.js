const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, subject, type, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = subject;
    if (type) filter.type = type;

    // Auto-update overdue status
    await Task.updateMany(
      { user: req.user._id, status: { $nin: ['completed'] }, deadline: { $lt: new Date() } },
      { status: 'overdue' }
    );

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('subject', 'name color icon')
      .populate('studyGroup', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pages: Math.ceil(total / limit),
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const taskData = { ...req.body, user: req.user._id };

    if (req.files && req.files.length > 0) {
      taskData.attachments = req.files.map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
        path: `/uploads/${req.user._id}/${f.filename}`,
        mimetype: f.mimetype,
        size: f.size,
      }));
    }

    const task = await Task.create(taskData);
    await task.populate('subject', 'name color icon');

    // Add XP for creating a task
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10 } });

    res.status(201).json({
      success: true,
      message: 'Task created! +10 XP',
      task,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id })
      .populate('subject', 'name color icon')
      .populate('studyGroup', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const wasCompleted = task.status === 'completed';
    const isNowCompleted = req.body.status === 'completed';

    Object.assign(task, req.body);

    if (isNowCompleted && !wasCompleted) {
      task.completedAt = new Date();

      // Award XP for completing a task
      const user = await User.findById(req.user._id);
      let xpGain = 50;
      if (task.priority === 'urgent') xpGain = 100;
      else if (task.priority === 'high') xpGain = 75;

      user.addXP(xpGain);
      user.totalTasksCompleted += 1;
      user.updateStreak();

      // Check for badge milestones
      if (user.totalTasksCompleted === 1) user.badges.push({ name: 'First Task', icon: '✅' });
      if (user.totalTasksCompleted === 10) user.badges.push({ name: 'Task Master', icon: '🏆' });
      if (user.totalTasksCompleted === 50) user.badges.push({ name: 'Productivity Pro', icon: '⚡' });
      if (user.streak >= 7) {
        const hasBadge = user.badges.some(b => b.name === 'Week Streak');
        if (!hasBadge) user.badges.push({ name: 'Week Streak', icon: '🔥' });
      }

      await user.save();
    }

    await task.save();
    await task.populate('subject', 'name color icon');

    res.status(200).json({
      success: true,
      message: isNowCompleted && !wasCompleted ? `Task completed! +${task.priority === 'urgent' ? 100 : task.priority === 'high' ? 75 : 50} XP` : 'Task updated',
      task,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update checklist item
// @route   PATCH /api/tasks/:id/checklist/:itemId
// @access  Private
const updateChecklistItem = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const item = task.checklist.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Checklist item not found' });

    item.completed = req.body.completed;
    await task.save();

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tasks analytics
// @route   GET /api/tasks/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [byStatus, byPriority, byType, recentCompletions] = await Promise.all([
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Task.find({
        user: userId,
        status: 'completed',
        completedAt: { $gte: thirtyDaysAgo },
      })
        .select('completedAt title priority')
        .sort('-completedAt')
        .limit(30),
    ]);

    res.status(200).json({
      success: true,
      analytics: { byStatus, byPriority, byType, recentCompletions },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask, updateChecklistItem, getAnalytics };
