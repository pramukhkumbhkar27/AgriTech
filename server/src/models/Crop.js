const mongoose = require('mongoose');

const fertilizerRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  fertilizerName: { type: String, required: true },
  quantity: { type: String, required: true },
  method: { type: String, default: 'Broadcasting' },
  notes: { type: String, default: '' },
});

const cropSchema = new mongoose.Schema(
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
      required: [true, 'Crop must be linked to a farm'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Oilseed', 'Commercial', 'Spice', 'Other'],
      default: 'Cereal',
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Year-Round'],
      default: 'Kharif',
    },
    fieldPlot: {
      type: String,
      default: 'Plot 1',
    },
    areaAllocated: {
      type: Number,
      default: 1,
    },
    areaUnit: {
      type: String,
      default: 'acres',
    },
    plantingDate: {
      type: Date,
      required: [true, 'Planting date is required'],
    },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Expected harvest date is required'],
    },
    actualHarvestDate: {
      type: Date,
      default: null,
    },
    growthStage: {
      type: String,
      enum: ['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvested'],
      default: 'Germination',
    },
    growthProgressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },
    healthStatus: {
      type: String,
      enum: ['Excellent', 'Good', 'Moderate', 'At Risk', 'Damaged'],
      default: 'Good',
    },
    irrigationSchedule: {
      frequencyDays: { type: Number, default: 3 },
      lastIrrigatedDate: { type: Date, default: null },
      nextIrrigationDate: { type: Date, default: null },
      waterSource: { type: String, default: 'Drip' },
      notes: { type: String, default: '' },
    },
    fertilizerRecords: [fertilizerRecordSchema],
    expectedYield: {
      amount: { type: Number, default: 0 },
      unit: { type: String, default: 'Quintals' },
    },
    harvestedYield: {
      amount: { type: Number, default: 0 },
      unit: { type: String, default: 'Quintals' },
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Harvested', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Crop', cropSchema);
