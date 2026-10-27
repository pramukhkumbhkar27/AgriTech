const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getReportedPosts,
  moderatePost,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.use(authorize('admin')); // All admin routes restricted to admin role

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);

router.get('/moderation/forum', getReportedPosts);
router.put('/moderation/forum/:id', moderatePost);

module.exports = router;
