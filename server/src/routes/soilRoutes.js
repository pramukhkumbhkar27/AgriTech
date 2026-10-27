const express = require('express');
const router = express.Router();
const {
  getSoilTests,
  getSoilTestById,
  createSoilTest,
  getSoilHistoryForFarm,
  deleteSoilTest,
} = require('../controllers/soilController');
const { protect } = require('../middleware/auth');
const { soilTestValidator } = require('../validators');

router.use(protect);

router.route('/')
  .get(getSoilTests)
  .post(soilTestValidator, createSoilTest);

router.get('/history/farm/:farmId', getSoilHistoryForFarm);

router.route('/:id')
  .get(getSoilTestById)
  .delete(deleteSoilTest);

module.exports = router;
