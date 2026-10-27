const mongoose = require('mongoose');

const soilTestSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    sampleCollectionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    plotIdentifier: {
      type: String,
      default: 'Main Plot',
      trim: true,
    },
    soilType: {
      type: String,
      default: 'Loamy',
    },
    // Measurements
    ph: {
      type: Number,
      required: [true, 'Soil pH is required'],
      min: [0, 'pH cannot be less than 0'],
      max: [14, 'pH cannot be more than 14'],
    },
    nitrogen: {
      type: Number, // mg/kg or kg/ha
      required: [true, 'Nitrogen (N) value is required'],
      min: 0,
    },
    phosphorus: {
      type: Number, // mg/kg or kg/ha
      required: [true, 'Phosphorus (P) value is required'],
      min: 0,
    },
    potassium: {
      type: Number, // mg/kg or kg/ha
      required: [true, 'Potassium (K) value is required'],
      min: 0,
    },
    moisture: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 25,
    },
    organicMatter: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 1.5,
    },
    dataSource: {
      type: String,
      enum: ['Manual Farmer Entry', 'Lab Report', 'Soil Sensor'],
      default: 'Manual Farmer Entry',
    },
    // Interpretation and suggestions (computed or saved)
    interpretation: {
      phStatus: { type: String, enum: ['Acidic', 'Slightly Acidic', 'Optimal / Neutral', 'Slightly Alkaline', 'Alkaline'] },
      nitrogenStatus: { type: String, enum: ['Low', 'Sufficient', 'High'] },
      phosphorusStatus: { type: String, enum: ['Low', 'Sufficient', 'High'] },
      potassiumStatus: { type: String, enum: ['Low', 'Sufficient', 'High'] },
      overallRating: { type: String, enum: ['Poor', 'Fair', 'Good', 'Excellent'] },
    },
    recommendations: [
      {
        parameter: String,
        issue: String,
        suggestion: String,
        actionType: String,
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    disclaimer: {
      type: String,
      default: 'Educational Advisory Notice: This interpretation is derived solely from user-entered or sensor metrics against general agronomical benchmarks. Crop-specific nutrition depends on soil depth, target yield, crop variety, and regional conditions.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SoilTest', soilTestSchema);
