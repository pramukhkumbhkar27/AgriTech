const express = require('express');
const router = express.Router();
const {
  getConsultations,
  getConsultationById,
  createConsultation,
  updateConsultationStatus,
  respondToConsultation,
} = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);

router.route('/')
  .get(getConsultations)
  .post(authorize('farmer', 'admin'), createConsultation);

router.route('/:id')
  .get(getConsultationById);

router.put('/:id/status', authorize('expert', 'admin'), updateConsultationStatus);
router.put('/:id/respond', authorize('expert', 'admin'), respondToConsultation);

module.exports = router;
