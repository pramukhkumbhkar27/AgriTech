const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farm must belong to a farmer'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      maxlength: [120, 'Farm name cannot exceed 120 characters'],
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, required: [true, 'City/Village is required'], trim: true },
      district: { type: String, default: '' },
      state: { type: String, required: [true, 'State is required'], trim: true },
      country: { type: String, default: 'India' },
      lat: { type: Number, default: null },
      lon: { type: Number, default: null },
    },
    totalArea: {
      type: Number,
      required: [true, 'Total farm area is required'],
      min: [0.01, 'Area must be greater than 0'],
    },
    areaUnit: {
      type: String,
      enum: ['acres', 'hectares', 'bigha'],
      default: 'acres',
    },
    soilType: {
      type: String,
      enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Clay', 'Sandy Loam', 'Loamy', 'Other'],
      default: 'Loamy',
    },
    irrigationType: {
      type: String,
      enum: ['Drip', 'Sprinkler', 'Canal', 'Tube Well', 'Rainfed', 'Other'],
      default: 'Drip',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for associated crops
farmSchema.virtual('crops', {
  ref: 'Crop',
  localField: '_id',
  foreignField: 'farm',
});

module.exports = mongoose.model('Farm', farmSchema);
