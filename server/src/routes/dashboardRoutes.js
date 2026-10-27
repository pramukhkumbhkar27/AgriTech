const express = require('express');
const router = express.Router();
const {
  getFarmerDashboard,
  getExpertDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);

router.get('/farmer', getFarmerDashboard);
router.get('/expert', authorize('expert', 'admin'), getExpertDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);

module.exports = router;
