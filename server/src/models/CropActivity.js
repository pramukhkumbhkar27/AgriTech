const mongoose = require('mongoose');

const cropActivitySchema = new mongoose.Schema(
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
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    activityType: {
      type: String,
      enum: ['Irrigation', 'Fertilization', 'Pesticide', 'Weeding', 'Harvesting', 'Scouting', 'Soil Testing', 'Other'],
      default: 'Irrigation',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    completedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CropActivity', cropActivitySchema);
