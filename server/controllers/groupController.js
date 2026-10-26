const StudyGroup = require('../models/StudyGroup');
const User = require('../models/User');

// @desc    Get all study groups for user
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find({
      'members.user': req.user._id,
      isActive: true,
    })
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar xp level')
      .sort('-createdAt');

    res.status(200).json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create study group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const group = new StudyGroup({
      ...req.body,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    await group.save();
    await group.populate('creator', 'name avatar');

    res.status(201).json({ success: true, message: 'Study group created!', group });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Join group by invite code
// @route   POST /api/groups/join
// @access  Private
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const group = await StudyGroup.findOne({ inviteCode, isActive: true });

    if (!group) return res.status(404).json({ success: false, message: 'Invalid invite code' });

    const isMember = group.members.some((m) => m.user.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ success: false, message: 'Already a member' });

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    group.members.push({ user: req.user._id, role: 'member' });
    group.announcements.push({
      author: req.user._id,
      message: `${req.user.name} joined the group! 🎉`,
    });

    await group.save();
    await group.populate('creator', 'name avatar');
    await group.populate('members.user', 'name avatar xp level');

    res.status(200).json({ success: true, message: 'Joined group successfully!', group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
const getGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findOne({
      _id: req.params.id,
      'members.user': req.user._id,
      isActive: true,
    })
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar xp level streak')
      .populate('sharedTasks')
      .populate('announcements.author', 'name avatar');

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    res.status(200).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post announcement
// @route   POST /api/groups/:id/announce
// @access  Private
const postAnnouncement = async (req, res) => {
  try {
    const group = await StudyGroup.findOne({
      _id: req.params.id,
      'members.user': req.user._id,
    });

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    group.announcements.push({ author: req.user._id, message: req.body.message });
    await group.save();
    await group.populate('announcements.author', 'name avatar');

    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave group
// @route   DELETE /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    group.members = group.members.filter((m) => m.user.toString() !== req.user._id.toString());
    await group.save();

    res.status(200).json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGroups, createGroup, joinGroup, getGroup, postAnnouncement, leaveGroup };
