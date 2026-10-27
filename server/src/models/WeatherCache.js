const mongoose = require('mongoose');

const weatherCacheSchema = new mongoose.Schema(
  {
    locationKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    source: {
      type: String,
      default: 'OpenWeatherMap API',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index auto deletes expired documents
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WeatherCache', weatherCacheSchema);
