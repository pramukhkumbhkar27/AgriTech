const User = require('../models/User');
const ForumPost = require('../models/ForumPost');

// @desc    Get all users with filtering, role filter, pagination (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query).select('-password').sort('-createdAt').skip(skip).limit(Number(limit));
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['farmer', 'expert', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role changed to ${role}`,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active/inactive status (Admin only)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deactivating own admin account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.isActive ? 'Active' : 'Suspended'}`,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reported forum posts for moderation (Admin only)
// @route   GET /api/admin/moderation/forum
// @access  Private (Admin)
const getReportedPosts = async (req, res, next) => {
  try {
    const reportedPosts = await ForumPost.find({ isReported: true })
      .populate('author', 'name email role')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: reportedPosts.length,
      reportedPosts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate reported forum post (Approve/Remove)
// @route   PUT /api/admin/moderation/forum/:id
// @access  Private (Admin)
const moderatePost = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'remove'
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (action === 'remove') {
      post.moderationStatus = 'Removed';
      post.isReported = false;
    } else {
      post.moderationStatus = 'Approved';
      post.isReported = false;
      post.reportReason = '';
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: `Post moderated: ${action === 'remove' ? 'Removed from public forum' : 'Approved and cleared'}`,
      post,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getReportedPosts,
  moderatePost,
};
