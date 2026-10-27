const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');

// @desc    Register a new user (farmer or expert only)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, location, specialization, experienceYears, languages, bio } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Protect against self-assigning admin role
    const assignedRole = role === 'expert' ? 'expert' : 'farmer';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      address: address || '',
      location: location || {},
      specialization: specialization || '',
      experienceYears: experienceYears || 0,
      languages: languages || ['English', 'Hindi'],
      bio: bio || '',
    });

    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, location, specialization, experienceYears, languages, bio } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (address !== undefined) fieldsToUpdate.address = address;
    if (location !== undefined) fieldsToUpdate.location = location;
    if (specialization !== undefined) fieldsToUpdate.specialization = specialization;
    if (experienceYears !== undefined) fieldsToUpdate.experienceYears = experienceYears;
    if (languages !== undefined) fieldsToUpdate.languages = languages;
    if (bio !== undefined) fieldsToUpdate.bio = bio;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// @desc    Get verified expert agricultural consultants
// @route   GET /api/auth/experts
// @access  Private/Public
const getExperts = async (req, res, next) => {
  try {
    const experts = await User.find({ role: 'expert', isActive: true }).select(
      'name email phone specialization experienceYears languages bio location createdAt'
    );
    res.status(200).json({
      success: true,
      count: experts.length,
      experts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  logout,
  getExperts,
};
