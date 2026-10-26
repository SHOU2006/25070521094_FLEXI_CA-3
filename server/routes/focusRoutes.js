const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { startSession, completeSession, getHistory, deleteSession } = require('../controllers/focusController');

router.post('/start', protect, startSession);
router.get('/history', protect, getHistory);
router.put('/:id/complete', protect, completeSession);
router.delete('/:id', protect, deleteSession);

module.exports = router;
