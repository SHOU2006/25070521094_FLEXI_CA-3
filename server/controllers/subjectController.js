const Subject = require('../models/Subject');
const Task = require('../models/Task');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id, isActive: true }).sort('name');
    res.status(200).json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Subject added!', subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single subject with tasks
// @route   GET /api/subjects/:id
// @access  Private
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const tasks = await Task.find({ subject: req.params.id, user: req.user._id }).sort('-createdAt');

    res.status(200).json({ success: true, subject, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, message: 'Subject updated', subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add grade to subject
// @route   POST /api/subjects/:id/grades
// @access  Private
const addGrade = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    subject.grades.push(req.body);
    subject.currentGPA = subject.calculateGPA();
    await subject.save();

    res.status(200).json({ success: true, message: 'Grade added', subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add note to subject
// @route   POST /api/subjects/:id/notes
// @access  Private
const addNote = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const noteData = { ...req.body };

    if (req.files && req.files.length > 0) {
      noteData.attachments = req.files.map((f) => ({
        filename: f.filename,
        path: `/uploads/${req.user._id}/${f.filename}`,
        mimetype: f.mimetype,
        size: f.size,
      }));
    }

    subject.notes.push(noteData);
    await subject.save();

    res.status(201).json({ success: true, message: 'Note added', subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete note from subject
// @route   DELETE /api/subjects/:id/notes/:noteId
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    subject.notes = subject.notes.filter((n) => n._id.toString() !== req.params.noteId);
    await subject.save();

    res.status(200).json({ success: true, message: 'Note deleted', subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSubjects, createSubject, getSubject, updateSubject, deleteSubject, addGrade, addNote, deleteNote };
