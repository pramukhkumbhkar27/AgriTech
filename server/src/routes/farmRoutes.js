const express = require('express');
const router = express.Router();
const {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
} = require('../controllers/farmController');
const { protect } = require('../middleware/auth');
const { farmValidator } = require('../validators');

router.use(protect); // All farm routes require authentication

router.route('/')
  .get(getFarms)
  .post(farmValidator, createFarm);

router.route('/:id')
  .get(getFarmById)
  .put(farmValidator, updateFarm)
  .delete(deleteFarm);

module.exports = router;
