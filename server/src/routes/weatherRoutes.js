const express = require('express');
const router = express.Router();
const {
  getWeatherByQuery,
  getWeatherForFarm,
} = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');

router.get('/', getWeatherByQuery);
router.get('/farm/:farmId', protect, getWeatherForFarm);

module.exports = router;
