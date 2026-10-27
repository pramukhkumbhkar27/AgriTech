const axios = require('axios');
const WeatherCache = require('../models/WeatherCache');

// Helper to calculate smart farming precautions based on meteorological indicators
const generateFarmingPrecautions = (weather) => {
  const precautions = [];
  const temp = weather.temperature;
  const humidity = weather.humidity;
  const windSpeed = weather.windSpeed;
  const condition = (weather.condition || '').toLowerCase();
  const rainChance = weather.rainChance || 0;

  if (rainChance > 60 || condition.includes('rain') || condition.includes('storm')) {
    precautions.push({
      type: 'warning',
      category: 'Spraying Alert',
      message: 'Postpone pesticide and foliar fertilizer spraying as upcoming rainfall will wash away chemicals.',
    });
    precautions.push({
      type: 'info',
      category: 'Drainage & Irrigation',
      message: 'Hold irrigation cycles. Inspect field drainage channels to prevent waterlogging and root rot.',
    });
  } else if (temp > 35) {
    precautions.push({
      type: 'warning',
      category: 'Heat Stress',
      message: 'High heat advisory. Provide light frequent drip irrigation during early morning or evening to combat evapotranspiration.',
    });
  } else if (temp < 10) {
    precautions.push({
      type: 'warning',
      category: 'Cold / Frost',
      message: 'Low temperature detected. Consider nighttime irrigation or protective row coverings to safeguard tender shoots from frost.',
    });
  } else {
    precautions.push({
      type: 'success',
      category: 'Field Operations',
      message: 'Favorable field conditions. Suitable for weeding, intercultural operations, and balanced fertilizer top-dressing.',
    });
  }

  if (windSpeed > 20) {
    precautions.push({
      type: 'warning',
      category: 'Wind Advisory',
      message: `High wind speed (${windSpeed} km/h). Avoid drone spraying and stake tall crops like maize, sugarcane, and bananas.`,
    });
  }

  if (humidity > 80 && temp > 24) {
    precautions.push({
      type: 'info',
      category: 'Fungal Risk',
      message: 'High humidity and warm temperatures create conducive environment for fungal blast and downy mildew. Monitor foliage closely.',
    });
  }

  return precautions;
};

// Fallback dynamic generator if no API key is provided or external service is unreachable
const getSimulatedWeatherData = (queryLocation) => {
  const baseCities = {
    pune: { temp: 28, humidity: 62, wind: 12, condition: 'Partly Cloudy', icon: '02d', rain: 10 },
    nagpur: { temp: 32, humidity: 48, wind: 9, condition: 'Sunny', icon: '01d', rain: 0 },
    delhi: { temp: 26, humidity: 55, wind: 11, condition: 'Clear Sky', icon: '01d', rain: 5 },
    ludhiana: { temp: 24, humidity: 60, wind: 8, condition: 'Sunny', icon: '01d', rain: 0 },
    bengaluru: { temp: 25, humidity: 70, wind: 14, condition: 'Scattered Clouds', icon: '03d', rain: 25 },
    jaipur: { temp: 30, humidity: 38, wind: 15, condition: 'Clear Sky', icon: '01d', rain: 0 },
  };

  const key = (queryLocation || 'Pune').toLowerCase();
  const match = baseCities[key] || {
    temp: 27,
    humidity: 60,
    wind: 10,
    condition: 'Partly Cloudy',
    icon: '02d',
    rain: 15,
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();

  const forecast = Array.from({ length: 7 }, (_, i) => {
    const dayName = days[(todayIndex + i) % 7];
    const variance = (i * 2 - 3);
    const dayTempMax = Math.round(match.temp + variance + 2);
    const dayTempMin = Math.round(match.temp + variance - 6);
    const rainP = Math.min(100, Math.max(0, match.rain + (i % 2 === 0 ? 15 : -5)));

    return {
      day: i === 0 ? 'Today' : dayName,
      date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      tempMax: dayTempMax,
      tempMin: dayTempMin,
      condition: rainP > 40 ? 'Light Rain' : match.condition,
      icon: rainP > 40 ? '10d' : match.icon,
      rainChance: rainP,
      humidity: Math.min(95, Math.max(30, match.humidity + (i % 3 === 0 ? 8 : -4))),
      windSpeed: match.wind + (i % 2),
    };
  });

  const currentData = {
    location: queryLocation || 'Pune, Maharashtra',
    temperature: match.temp,
    feelsLike: match.temp + 1,
    tempMin: match.temp - 5,
    tempMax: match.temp + 4,
    humidity: match.humidity,
    windSpeed: match.wind,
    condition: match.condition,
    description: `Optimal farming weather with ${match.condition.toLowerCase()}`,
    icon: match.icon,
    rainChance: match.rain,
    pressure: 1012,
    uvIndex: 6,
    sunrise: '06:14 AM',
    sunset: '06:05 PM',
    lastUpdated: new Date().toISOString(),
    forecast,
    source: 'Agri-Tech Agricultural Agro-Meteorology Model (Simulated Fallback)',
    isRealtimeAPI: false,
  };

  currentData.precautions = generateFarmingPrecautions(currentData);
  return currentData;
};

const getWeather = async (queryLocation) => {
  const sanitized = (queryLocation || 'Pune').trim();
  const cacheKey = sanitized.toLowerCase();

  // 1. Check local cache
  try {
    const cached = await WeatherCache.findOne({ locationKey: cacheKey });
    if (cached && cached.expiresAt > new Date()) {
      return { ...cached.data, cached: true, cacheExpiresAt: cached.expiresAt };
    }
  } catch (err) {
    console.warn('[WeatherService] Cache lookup error:', err.message);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  // 2. If API Key is present, query OpenWeather API
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_openweather_api_key_here') {
    try {
      const geoUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        sanitized
      )}&units=metric&appid=${apiKey}`;
      const response = await axios.get(geoUrl, { timeout: 5000 });
      const raw = response.data;

      // Also attempt 5-day forecast
      let forecastDays = [];
      try {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          sanitized
        )}&units=metric&appid=${apiKey}`;
        const fRes = await axios.get(forecastUrl, { timeout: 5000 });
        const list = fRes.data.list;

        // Group into distinct days
        const grouped = {};
        list.forEach((item) => {
          const date = item.dt_txt.split(' ')[0];
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(item);
        });

        forecastDays = Object.keys(grouped).slice(0, 7).map((dateStr, idx) => {
          const dayItems = grouped[dateStr];
          const temps = dayItems.map((d) => d.main.temp);
          const max = Math.round(Math.max(...temps));
          const min = Math.round(Math.min(...temps));
          const midItem = dayItems[Math.floor(dayItems.length / 2)] || dayItems[0];
          const dateObj = new Date(dateStr);
          const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

          return {
            day: dayName,
            date: dateStr,
            tempMax: max,
            tempMin: min,
            condition: midItem.weather[0].main,
            icon: midItem.weather[0].icon,
            rainChance: Math.round((midItem.pop || 0) * 100),
            humidity: midItem.main.humidity,
            windSpeed: Math.round((midItem.wind.speed || 0) * 3.6),
          };
        });
      } catch (fErr) {
        console.warn('[WeatherService] Forecast sub-query warning:', fErr.message);
      }

      const weatherData = {
        location: `${raw.name}, ${raw.sys.country}`,
        temperature: Math.round(raw.main.temp),
        feelsLike: Math.round(raw.main.feels_like),
        tempMin: Math.round(raw.main.temp_min),
        tempMax: Math.round(raw.main.temp_max),
        humidity: raw.main.humidity,
        windSpeed: Math.round(raw.wind.speed * 3.6), // convert m/s to km/h
        condition: raw.weather[0].main,
        description: raw.weather[0].description,
        icon: raw.weather[0].icon,
        rainChance: raw.rain ? 75 : 10,
        pressure: raw.main.pressure,
        sunrise: new Date(raw.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(raw.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lastUpdated: new Date().toISOString(),
        forecast: forecastDays.length > 0 ? forecastDays : getSimulatedWeatherData(sanitized).forecast,
        source: 'OpenWeatherMap Live API',
        isRealtimeAPI: true,
      };

      weatherData.precautions = generateFarmingPrecautions(weatherData);

      // Cache for 30 minutes
      await WeatherCache.findOneAndUpdate(
        { locationKey: cacheKey },
        {
          locationKey: cacheKey,
          query: sanitized,
          data: weatherData,
          source: 'OpenWeatherMap Live API',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
        { upsert: true }
      );

      return weatherData;
    } catch (apiError) {
      console.warn(`[WeatherService] OpenWeather API call failed (${apiError.message}), falling back to agronomical model.`);
    }
  }

  // 3. Fallback to agricultural simulation
  const simulated = getSimulatedWeatherData(sanitized);

  // Cache simulated for 10 minutes
  try {
    await WeatherCache.findOneAndUpdate(
      { locationKey: cacheKey },
      {
        locationKey: cacheKey,
        query: sanitized,
        data: simulated,
        source: simulated.source,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true }
    );
  } catch (err) {
    // silent
  }

  return simulated;
};

module.exports = {
  getWeather,
  generateFarmingPrecautions,
};
