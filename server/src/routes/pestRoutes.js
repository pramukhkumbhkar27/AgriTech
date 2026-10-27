const express = require('express');
const router = express.Router();
const {
  getPestAlerts,
  getPestAlertById,
  createPestAlert,
  updateAlertStatus,
  verifyAlert,
} = require('../controllers/pestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', getPestAlerts);
router.get('/:id', getPestAlertById);

router.post('/', protect, createPestAlert);
router.put('/:id/status', protect, updateAlertStatus);
router.put('/:id/verify', protect, authorize('expert', 'admin'), verifyAlert);

module.exports = router;
