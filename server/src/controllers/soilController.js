const SoilTest = require('../models/SoilTest');
const Farm = require('../models/Farm');
const { interpretSoilMetrics } = require('../services/soilService');

// @desc    Get all soil test records for the farmer
// @route   GET /api/soil
// @access  Private
const getSoilTests = async (req, res, next) => {
  try {
    const { farm, sort, limit = 50 } = req.query;

    const query = {};
    if (req.user.role !== 'admin') {
      query.farmer = req.user.id;
    }

    if (farm) query.farm = farm;

    const soilTests = await SoilTest.find(query)
      .populate('farm', 'name location totalArea soilType')
      .sort(sort === 'oldest' ? 'sampleCollectionDate' : '-sampleCollectionDate')
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: soilTests.length,
      soilTests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single soil test
// @route   GET /api/soil/:id
// @access  Private
const getSoilTestById = async (req, res, next) => {
  try {
    const soilTest = await SoilTest.findById(req.params.id).populate('farm', 'name location soilType');

    if (!soilTest) {
      return res.status(404).json({
        success: false,
        message: 'Soil test record not found',
      });
    }

    if (soilTest.farmer.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this record',
      });
    }

    res.status(200).json({
      success: true,
      soilTest,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new soil test record
// @route   POST /api/soil
// @access  Private
const createSoilTest = async (req, res, next) => {
  try {
    const {
      farm,
      sampleCollectionDate,
      plotIdentifier,
      soilType,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      moisture,
      organicMatter,
      dataSource,
      notes,
    } = req.body;

    const farmRecord = await Farm.findById(farm);
    if (!farmRecord) {
      return res.status(404).json({
        success: false,
        message: 'Associated farm not found',
      });
    }

    if (farmRecord.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only add soil tests to your own farms',
      });
    }

    // Run agronomic interpretation algorithm
    const analysis = interpretSoilMetrics({
      ph: Number(ph),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      moisture: moisture !== undefined ? Number(moisture) : 25,
      organicMatter: organicMatter !== undefined ? Number(organicMatter) : 1.5,
    });

    const soilTest = await SoilTest.create({
      farmer: req.user.id,
      farm,
      sampleCollectionDate: sampleCollectionDate || new Date(),
      plotIdentifier: plotIdentifier || 'Main Plot',
      soilType: soilType || farmRecord.soilType || 'Loamy',
      ph: Number(ph),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      moisture: moisture !== undefined ? Number(moisture) : 25,
      organicMatter: organicMatter !== undefined ? Number(organicMatter) : 1.5,
      dataSource: dataSource || 'Manual Farmer Entry',
      interpretation: analysis.interpretation,
      recommendations: analysis.recommendations,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Soil test record created and educational analysis completed successfully',
      soilTest,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get chronological soil timeline/comparison for a farm
// @route   GET /api/soil/history/farm/:farmId
// @access  Private
const getSoilHistoryForFarm = async (req, res, next) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    if (farm.farmer.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const history = await SoilTest.find({ farm: farmId })
      .sort('sampleCollectionDate')
      .select('sampleCollectionDate plotIdentifier ph nitrogen phosphorus potassium moisture organicMatter interpretation');

    res.status(200).json({
      success: true,
      farmName: farm.name,
      count: history.length,
      history,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete soil test record
// @route   DELETE /api/soil/:id
// @access  Private
const deleteSoilTest = async (req, res, next) => {
  try {
    const soilTest = await SoilTest.findById(req.params.id);

    if (!soilTest) {
      return res.status(404).json({
        success: false,
        message: 'Soil test record not found',
      });
    }

    if (soilTest.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await soilTest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Soil test record deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSoilTests,
  getSoilTestById,
  createSoilTest,
  getSoilHistoryForFarm,
  deleteSoilTest,
};
