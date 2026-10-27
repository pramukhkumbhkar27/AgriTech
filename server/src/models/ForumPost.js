const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: ['General Discussion', 'Crops & Soil', 'Pest Control', 'Market & Prices', 'Modern Equipment', 'Government Schemes'],
      default: 'General Discussion',
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      default: '',
    },
    moderationStatus: {
      type: String,
      enum: ['Approved', 'Flagged', 'Removed'],
      default: 'Approved',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

forumPostSchema.virtual('comments', {
  ref: 'ForumComment',
  localField: '_id',
  foreignField: 'post',
});

module.exports = mongoose.model('ForumPost', forumPostSchema);
