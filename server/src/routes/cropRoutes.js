const express = require('express');
const router = express.Router();
const {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  addFertilizerRecord,
  deleteCrop,
  getReferenceCropDatabase,
} = require('../controllers/cropController');
const { protect } = require('../middleware/auth');
const { cropValidator } = require('../validators');

router.get('/reference/database', getReferenceCropDatabase);

router.use(protect);

router.route('/')
  .get(getCrops)
  .post(cropValidator, createCrop);

router.route('/:id')
  .get(getCropById)
  .put(updateCrop)
  .delete(deleteCrop);

router.post('/:id/fertilizer', addFertilizerRecord);

module.exports = router;
