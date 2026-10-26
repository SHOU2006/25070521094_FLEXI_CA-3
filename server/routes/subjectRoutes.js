const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  addGrade,
  addNote,
  deleteNote,
} = require('../controllers/subjectController');

router.route('/').get(protect, getSubjects).post(protect, createSubject);
router.route('/:id').get(protect, getSubject).put(protect, updateSubject).delete(protect, deleteSubject);
router.post('/:id/grades', protect, addGrade);
router.post('/:id/notes', protect, upload.array('attachments', 5), addNote);
router.delete('/:id/notes/:noteId', protect, deleteNote);

module.exports = router;
