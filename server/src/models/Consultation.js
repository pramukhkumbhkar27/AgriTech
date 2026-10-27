const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  comment: { type: String, default: '' },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const consultationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      enum: [
        'Crop Health & Disease',
        'Soil Fertility & Nutrients',
        'Irrigation Management',
        'Pest Control & Spraying',
        'Yield Optimization',
        'Organic Certification & Practice',
        'Other Farming Advisory',
      ],
      default: 'Crop Health & Disease',
    },
    urgency: {
      type: String,
      enum: ['Normal', 'High', 'Critical'],
      default: 'Normal',
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred consultation date is required'],
    },
    problemDescription: {
      type: String,
      required: [true, 'Problem description is required'],
      minlength: [10, 'Please describe the issue in at least 10 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    expertResponse: {
      diagnosis: { type: String, default: '' },
      advice: { type: String, default: '' },
      suggestedTreatments: [String],
      respondedAt: { type: Date, default: null },
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Consultation', consultationSchema);
