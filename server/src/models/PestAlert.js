const mongoose = require('mongoose');

const pestAlertSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pestName: {
      type: String,
      required: [true, 'Pest or disease name is required'],
      trim: true,
    },
    scientificName: {
      type: String,
      default: '',
      trim: true,
    },
    cropAffected: {
      type: String,
      required: [true, 'Affected crop name is required'],
      trim: true,
    },
    symptoms: {
      type: String,
      required: [true, 'Symptoms description is required'],
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    affectedRegion: {
      type: String,
      required: [true, 'Affected region or district is required'],
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null,
    },
    prevention: {
      type: String,
      default: '',
    },
    management: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Acknowledged', 'Resolved'],
      default: 'New',
    },
    isVerifiedAdvisory: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isSampleContent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PestAlert', pestAlertSchema);
