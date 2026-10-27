const PestAlert = require('../models/PestAlert');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all pest and disease alerts (with filters and search)
// @route   GET /api/pests
// @access  Public/Private
const getPestAlerts = async (req, res, next) => {
  try {
    const { crop, severity, status, search, verifiedOnly } = req.query;

    const query = {};
    if (crop) query.cropAffected = { $regex: crop, $options: 'i' };
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (verifiedOnly === 'true') query.isVerifiedAdvisory = true;

    if (search) {
      query.$or = [
        { pestName: { $regex: search, $options: 'i' } },
        { cropAffected: { $regex: search, $options: 'i' } },
        { affectedRegion: { $regex: search, $options: 'i' } },
        { symptoms: { $regex: search, $options: 'i' } },
      ];
    }

    const alerts = await PestAlert.find(query)
      .populate('creator', 'name role')
      .populate('verifiedBy', 'name specialization')
      .populate('farm', 'name location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single pest alert by ID
// @route   GET /api/pests/:id
// @access  Public/Private
const getPestAlertById = async (req, res, next) => {
  try {
    const alert = await PestAlert.findById(req.params.id)
      .populate('creator', 'name role')
      .populate('verifiedBy', 'name specialization')
      .populate('farm', 'name location');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Pest alert not found',
      });
    }

    res.status(200).json({
      success: true,
      alert,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Report a suspected pest/disease or publish expert advisory
// @route   POST /api/pests
// @access  Private
const createPestAlert = async (req, res, next) => {
  try {
    const {
      pestName,
      scientificName,
      cropAffected,
      symptoms,
      severity,
      affectedRegion,
      farm,
      prevention,
      management,
      isSampleContent,
    } = req.body;

    const isExpertOrAdmin = req.user.role === 'expert' || req.user.role === 'admin';

    const alert = await PestAlert.create({
      creator: req.user.id,
      pestName,
      scientificName: scientificName || '',
      cropAffected,
      symptoms,
      severity: severity || 'Medium',
      affectedRegion,
      farm: farm || null,
      prevention: prevention || '',
      management: management || '',
      isVerifiedAdvisory: isExpertOrAdmin,
      verifiedBy: isExpertOrAdmin ? req.user.id : null,
      isSampleContent: Boolean(isSampleContent),
    });

    // If critical or high, notify farmers in region/system
    if (['High', 'Critical'].includes(alert.severity)) {
      const farmers = await User.find({ role: 'farmer' }).select('_id');
      const notifications = farmers.map((f) => ({
        recipient: f._id,
        title: `Pest Alert: ${alert.pestName} in ${alert.cropAffected}`,
        message: `High severity alert registered for ${alert.cropAffected} in ${alert.affectedRegion}. Check prevention advisory.`,
        type: 'PestAlert',
        link: `/pest-alerts/${alert._id}`,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: isExpertOrAdmin
        ? 'Verified pest advisory published successfully'
        : 'Pest report submitted for expert advisory review',
      alert,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update alert status (acknowledge, resolve)
// @route   PUT /api/pests/:id/status
// @access  Private
const updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const alert = await PestAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Pest alert not found',
      });
    }

    alert.status = status;
    await alert.save();

    res.status(200).json({
      success: true,
      message: `Alert marked as ${status}`,
      alert,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify advisory by expert/admin
// @route   PUT /api/pests/:id/verify
// @access  Private (Expert or Admin)
const verifyAlert = async (req, res, next) => {
  try {
    const { prevention, management } = req.body;
    const alert = await PestAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Pest alert not found',
      });
    }

    alert.isVerifiedAdvisory = true;
    alert.verifiedBy = req.user.id;
    if (prevention) alert.prevention = prevention;
    if (management) alert.management = management;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Pest alert verified with official management advisory',
      alert,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPestAlerts,
  getPestAlertById,
  createPestAlert,
  updateAlertStatus,
  verifyAlert,
};
