const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getGroups, createGroup, joinGroup, getGroup, postAnnouncement, leaveGroup } = require('../controllers/groupController');

router.route('/').get(protect, getGroups).post(protect, createGroup);
router.post('/join', protect, joinGroup);
router.get('/:id', protect, getGroup);
router.post('/:id/announce', protect, postAnnouncement);
router.delete('/:id/leave', protect, leaveGroup);

module.exports = router;
