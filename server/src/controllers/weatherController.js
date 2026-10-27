const { getWeather } = require('../services/weatherService');
const Farm = require('../models/Farm');

// @desc    Get weather for a given query (city, district, or coordinates)
// @route   GET /api/weather
// @access  Public/Private
const getWeatherByQuery = async (req, res, next) => {
  try {
    const locationQuery = req.query.location || 'Pune';
    const weather = await getWeather(locationQuery);

    res.status(200).json({
      success: true,
      weather,
      apiConfigurationGuide: {
        note: 'Live weather queries OpenWeatherMap API when OPENWEATHER_API_KEY is configured in server/.env.',
        howToGetApiKey: '1. Register for a free account at https://openweathermap.org/api 2. Copy your API Key 3. Place OPENWEATHER_API_KEY=your_key in server/.env 4. Restart server.',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get weather tailored for a specific farm
// @route   GET /api/weather/farm/:farmId
// @access  Private
const getWeatherForFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    const locationQuery = farm.location.city || farm.location.state || 'Pune';
    const weather = await getWeather(locationQuery);

    res.status(200).json({
      success: true,
      farm: {
        id: farm._id,
        name: farm.name,
        city: farm.location.city,
        state: farm.location.state,
      },
      weather,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWeatherByQuery,
  getWeatherForFarm,
};
