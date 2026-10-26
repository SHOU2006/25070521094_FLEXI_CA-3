const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getGoals, createGoal, updateGoal, deleteGoal, toggleMilestone } = require('../controllers/goalController');

router.route('/').get(protect, getGoals).post(protect, createGoal);
router.route('/:id').put(protect, updateGoal).delete(protect, deleteGoal);
router.patch('/:id/milestone/:milestoneId', protect, toggleMilestone);

module.exports = router;
