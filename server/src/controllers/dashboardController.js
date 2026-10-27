const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const CropActivity = require('../models/CropActivity');
const SoilTest = require('../models/SoilTest');
const PestAlert = require('../models/PestAlert');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { getWeather } = require('../services/weatherService');

// @desc    Get aggregated Farmer Dashboard metrics
// @route   GET /api/dashboard/farmer
// @access  Private (Farmer)
const getFarmerDashboard = async (req, res, next) => {
  try {
    const farmerId = req.user.id;

    // 1. Counts
    const totalFarms = await Farm.countDocuments({ farmer: farmerId });
    const totalCrops = await Crop.countDocuments({ farmer: farmerId });
    const activeCropCycles = await Crop.countDocuments({ farmer: farmerId, status: 'Active' });

    // 2. Farms list (with coordinates/location)
    const farms = await Farm.find({ farmer: farmerId }).sort('-createdAt').limit(5);

    // Primary location for weather
    const primaryLocation = farms[0]?.location?.city || req.user?.location?.city || 'Pune';
    const weather = await getWeather(primaryLocation);

    // 3. Active crops with health & growth stage
    const activeCrops = await Crop.find({ farmer: farmerId, status: 'Active' })
      .populate('farm', 'name')
      .sort('-growthProgressPercentage')
      .limit(6);

    // 4. Upcoming farm activities (scheduled for future or pending)
    const upcomingActivities = await CropActivity.find({
      farmer: farmerId,
      status: 'Pending',
    })
      .populate('crop', 'name')
      .populate('farm', 'name')
      .sort('scheduledDate')
      .limit(6);

    // 5. Recent soil tests
    const recentSoilTests = await SoilTest.find({ farmer: farmerId })
      .populate('farm', 'name')
      .sort('-sampleCollectionDate')
      .limit(3);

    // 6. Active pest alerts relevant to user's region or crops
    const activePestAlerts = await PestAlert.find({ status: { $ne: 'Resolved' } })
      .sort('-createdAt')
      .limit(4);

    // 7. Recent notifications
    const notifications = await Notification.find({ recipient: farmerId })
      .sort('-createdAt')
      .limit(5);

    // 8. Chart analytics: Crop growth stages & distribution
    const cropsDistribution = await Crop.aggregate([
      { $match: { farmer: req.user._id, status: 'Active' } },
      { $group: { _id: '$growthStage', count: { $sum: 1 } } },
    ]);

    // Crop Health breakdown
    const healthBreakdown = await Crop.aggregate([
      { $match: { farmer: req.user._id, status: 'Active' } },
      { $group: { _id: '$healthStatus', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        counts: {
          totalFarms,
          totalCrops,
          activeCropCycles,
        },
        farms,
        activeCrops,
        upcomingActivities,
        weather,
        recentSoilTests,
        activePestAlerts,
        notifications,
        charts: {
          cropsDistribution,
          healthBreakdown,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get aggregated Expert Dashboard metrics
// @route   GET /api/dashboard/expert
// @access  Private (Expert)
const getExpertDashboard = async (req, res, next) => {
  try {
    const expertId = req.user.id;

    const pendingRequests = await Consultation.countDocuments({ expert: expertId, status: 'Pending' });
    const acceptedCases = await Consultation.countDocuments({ expert: expertId, status: 'Accepted' });
    const completedConsultations = await Consultation.countDocuments({ expert: expertId, status: 'Completed' });
    const verifiedAdvisories = await PestAlert.countDocuments({ verifiedBy: expertId });

    const recentConsultations = await Consultation.find({ expert: expertId })
      .populate('farmer', 'name email phone location')
      .populate('farm', 'name location')
      .sort('-createdAt')
      .limit(8);

    const pendingAdvisories = await PestAlert.find({ isVerifiedAdvisory: false })
      .populate('creator', 'name')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          pendingRequests,
          acceptedCases,
          completedConsultations,
          verifiedAdvisories,
        },
        recentConsultations,
        pendingAdvisories,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get aggregated Admin Dashboard metrics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const farmersCount = await User.countDocuments({ role: 'farmer' });
    const expertsCount = await User.countDocuments({ role: 'expert' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    const totalFarms = await Farm.countDocuments();
    const totalCrops = await Crop.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalConsultations = await Consultation.countDocuments();
    const totalPestAlerts = await PestAlert.countDocuments();

    // Calculate revenue from orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('farmer', 'name email')
      .sort('-createdAt')
      .limit(6);

    // Recent users
    const recentUsers = await User.find().select('name email role createdAt isActive').sort('-createdAt').limit(6);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          farmersCount,
          expertsCount,
          adminsCount,
          totalFarms,
          totalCrops,
          totalProducts,
          totalOrders,
          totalConsultations,
          totalPestAlerts,
          totalRevenue,
        },
        ordersByStatus,
        recentOrders,
        recentUsers,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFarmerDashboard,
  getExpertDashboard,
  getAdminDashboard,
};
