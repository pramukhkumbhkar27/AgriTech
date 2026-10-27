const CropActivity = require('../models/CropActivity');
const Farm = require('../models/Farm');

// @desc    Get all calendar activities for farmer
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { farm, status, type, month, year } = req.query;
    const query = { farmer: req.user.id };

    if (farm) query.farm = farm;
    if (status) query.status = status;
    if (type) query.activityType = type;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.scheduledDate = { $gte: startDate, $lte: endDate };
    }

    const activities = await CropActivity.find(query)
      .populate('farm', 'name location')
      .populate('crop', 'name variety growthStage')
      .sort('scheduledDate');

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create calendar activity / reminder
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res, next) => {
  try {
    const { farm, crop, title, activityType, scheduledDate, priority, notes } = req.body;

    const farmDoc = await Farm.findById(farm);
    if (!farmDoc || (farmDoc.farmer.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Invalid farm or not authorized',
      });
    }

    const activity = await CropActivity.create({
      farmer: req.user.id,
      farm,
      crop: crop || null,
      title,
      activityType: activityType || 'Irrigation',
      scheduledDate,
      priority: priority || 'Medium',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Farm activity reminder added to calendar',
      activity,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update activity / toggle status
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res, next) => {
  try {
    let activity = await CropActivity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    if (activity.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (req.body.status === 'Completed' && activity.status !== 'Completed') {
      req.body.completedDate = new Date();
    }

    activity = await CropActivity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Activity updated',
      activity,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await CropActivity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    if (activity.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
};
