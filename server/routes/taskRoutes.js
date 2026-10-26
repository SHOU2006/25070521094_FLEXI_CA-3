const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateChecklistItem,
  getAnalytics,
} = require('../controllers/taskController');

router.get('/analytics', protect, getAnalytics);
router.route('/').get(protect, getTasks).post(protect, upload.array('attachments', 5), createTask);
router.route('/:id').get(protect, getTask).put(protect, updateTask).delete(protect, deleteTask);
router.patch('/:id/checklist/:itemId', protect, updateChecklistItem);

module.exports = router;
