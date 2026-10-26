const StudyGoal = require('../models/StudyGoal');

// @desc    Get all study goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const goals = await StudyGoal.find(filter)
      .populate('linkedSubject', 'name color icon')
      .sort('-createdAt');

    res.status(200).json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create study goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const goal = await StudyGoal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Goal created!', goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await StudyGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('linkedSubject', 'name color icon');

    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    res.status(200).json({ success: true, message: 'Goal updated', goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await StudyGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle milestone
// @route   PATCH /api/goals/:id/milestone/:milestoneId
// @access  Private
const toggleMilestone = async (req, res) => {
  try {
    const goal = await StudyGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;

    // Auto-calculate progress
    const total = goal.milestones.length;
    const done = goal.milestones.filter((m) => m.completed).length;
    goal.progress = total > 0 ? Math.round((done / total) * 100) : 0;
    if (goal.progress === 100) goal.status = 'completed';

    await goal.save();

    res.status(200).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, toggleMilestone };
