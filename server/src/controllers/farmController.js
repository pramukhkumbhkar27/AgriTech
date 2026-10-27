const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const SoilTest = require('../models/SoilTest');

// @desc    Get all farms for the logged in farmer (or all for admin)
// @route   GET /api/farms
// @access  Private
const getFarms = async (req, res, next) => {
  try {
    const { search, soilType, irrigationType, sort } = req.query;

    const query = {};
    if (req.user.role !== 'admin') {
      query.farmer = req.user.id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
      ];
    }

    if (soilType) query.soilType = soilType;
    if (irrigationType) query.irrigationType = irrigationType;

    let sortBy = '-createdAt';
    if (sort === 'area-asc') sortBy = 'totalArea';
    if (sort === 'area-desc') sortBy = '-totalArea';
    if (sort === 'name-asc') sortBy = 'name';
    if (sort === 'name-desc') sortBy = '-name';

    const farms = await Farm.find(query).sort(sortBy).populate('farmer', 'name email');

    // Attach active crop count to each farm
    const farmsWithStats = await Promise.all(
      farms.map(async (farm) => {
        const cropCount = await Crop.countDocuments({ farm: farm._id, status: 'Active' });
        const farmObj = farm.toObject();
        farmObj.activeCropCount = cropCount;
        return farmObj;
      })
    );

    res.status(200).json({
      success: true,
      count: farmsWithStats.length,
      farms: farmsWithStats,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single farm details with crops and soil tests
// @route   GET /api/farms/:id
// @access  Private
const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id).populate('farmer', 'name email');

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    // Ownership check
    if (farm.farmer._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this farm',
      });
    }

    const crops = await Crop.find({ farm: farm._id }).sort('-createdAt');
    const recentSoilTests = await SoilTest.find({ farm: farm._id }).sort('-sampleCollectionDate').limit(5);

    res.status(200).json({
      success: true,
      farm,
      crops,
      recentSoilTests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new farm
// @route   POST /api/farms
// @access  Private (Farmer or Admin)
const createFarm = async (req, res, next) => {
  try {
    const { name, location, totalArea, areaUnit, soilType, irrigationType, description } = req.body;

    const farm = await Farm.create({
      farmer: req.user.id,
      name,
      location,
      totalArea,
      areaUnit: areaUnit || 'acres',
      soilType: soilType || 'Loamy',
      irrigationType: irrigationType || 'Drip',
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      farm,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a farm
// @route   PUT /api/farms/:id
// @access  Private
const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    // Ownership check
    if (farm.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this farm',
      });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Farm updated successfully',
      farm,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a farm
// @route   DELETE /api/farms/:id
// @access  Private
const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    // Ownership check
    if (farm.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this farm',
      });
    }

    // Also delete or archive associated crops
    await Crop.deleteMany({ farm: farm._id });
    await SoilTest.deleteMany({ farm: farm._id });
    await farm.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Farm and associated crop records deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
};
