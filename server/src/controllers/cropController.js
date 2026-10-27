const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const CropActivity = require('../models/CropActivity');
const Notification = require('../models/Notification');

// Curated reference crop database
const referenceCropDatabase = [
  {
    name: 'Wheat (गेहूं)',
    scientificName: 'Triticum aestivum',
    category: 'Cereal',
    season: 'Rabi',
    optimalPh: '6.0 - 7.5',
    waterRequirement: '450 - 650 mm (4-6 irrigations at CRI, tillering, flowering, grain-filling)',
    soilTypes: ['Alluvial', 'Loamy', 'Clay Loam'],
    growthDurationDays: 120,
    stages: ['Germination (0-15d)', 'Crown Root Initiation (20-25d)', 'Tillering (40-45d)', 'Flowering/Heading (70-85d)', 'Milking/Dough (90-105d)', 'Maturity (110-125d)'],
    recommendedFertilizer: 'NPK 120:60:40 kg/ha. Apply 50% N + full P & K as basal; remaining N at first irrigation.',
    commonPests: ['Aphids', 'Termites', 'Rusts (Yellow/Brown)', 'Loose Smut'],
    harvestTips: 'Harvest when grains become hard and straw turns golden yellow with moisture around 14%.',
  },
  {
    name: 'Paddy / Rice (धान)',
    scientificName: 'Oryza sativa',
    category: 'Cereal',
    season: 'Kharif',
    optimalPh: '5.5 - 7.0',
    waterRequirement: '1200 - 1800 mm (Standing water 2-5 cm during vegetative stage)',
    soilTypes: ['Clay', 'Clayey Loam', 'Alluvial'],
    growthDurationDays: 130,
    stages: ['Nursery (0-25d)', 'Tillering (30-50d)', 'Panicle Initiation (60-70d)', 'Flowering (85-95d)', 'Grain Hardening (100-120d)', 'Harvest (130d)'],
    recommendedFertilizer: 'NPK 100:50:50 kg/ha with Zinc Sulfate (25 kg/ha). Split N into 3 stages.',
    commonPests: ['Stem Borer', 'Brown Planthopper', 'Bacterial Leaf Blight', 'Blast'],
    harvestTips: 'Harvest when 80-85% of the panicles turn golden brown. Drain water 10 days before harvest.',
  },
  {
    name: 'Cotton (कपास)',
    scientificName: 'Gossypium hirsutum',
    category: 'Commercial',
    season: 'Kharif',
    optimalPh: '6.5 - 8.0',
    waterRequirement: '700 - 1200 mm',
    soilTypes: ['Black Soil (Regur)', 'Deep Alluvial'],
    growthDurationDays: 160,
    stages: ['Emergence (0-10d)', 'Squaring (35-50d)', 'Flowering (60-80d)', 'Boll Formation (90-130d)', 'Boll Bursting & Maturity (140-160d)'],
    recommendedFertilizer: 'NPK 100:50:50 kg/ha. Foliar spray of Potassium Nitrate during boll formation.',
    commonPests: ['Pink Bollworm', 'Whitefly', 'Thrips', 'Fusarium Wilt'],
    harvestTips: 'Pick cotton in clean dry weather when bolls burst fully open. Avoid morning dew.',
  },
  {
    name: 'Tomato (टमाटर)',
    scientificName: 'Solanum lycopersicum',
    category: 'Vegetable',
    season: 'Year-Round',
    optimalPh: '6.0 - 6.8',
    waterRequirement: '600 - 800 mm (Consistent drip irrigation)',
    soilTypes: ['Sandy Loam', 'Loamy', 'Black'],
    growthDurationDays: 95,
    stages: ['Seedling (0-25d)', 'Vegetative (25-45d)', 'Flowering (45-60d)', 'Fruit Setting (60-75d)', 'Ripening & Harvesting (75-95d)'],
    recommendedFertilizer: 'NPK 150:100:100 kg/ha + calcium boron spray to prevent blossom end rot.',
    commonPests: ['Fruit Borer (Helicoverpa)', 'Early Blight', 'Late Blight', 'Leaf Curl Virus'],
    harvestTips: 'Harvest at breaker stage for distant transport or red ripe stage for immediate local market.',
  },
  {
    name: 'Soybean (सोयाबीन)',
    scientificName: 'Glycine max',
    category: 'Oilseed',
    season: 'Kharif',
    optimalPh: '6.0 - 7.5',
    waterRequirement: '450 - 700 mm',
    soilTypes: ['Well-drained Black Soil', 'Loamy'],
    growthDurationDays: 100,
    stages: ['Emergence (0-7d)', 'Vegetative (8-30d)', 'Flowering (35-45d)', 'Pod Development (50-70d)', 'Pod Filling & Maturity (75-100d)'],
    recommendedFertilizer: 'NPK 30:60:40 kg/ha with Rhizobium seed inoculation.',
    commonPests: ['Girdle Beetle', 'Semilooper', 'Yellow Mosaic Virus'],
    harvestTips: 'Harvest when 95% of pods turn golden brown and leaves drop naturally.',
  },
];

// @desc    Get crops for farmer
// @route   GET /api/crops
// @access  Private
const getCrops = async (req, res, next) => {
  try {
    const { farm, category, season, status, search } = req.query;

    const query = {};
    if (req.user.role !== 'admin') {
      query.farmer = req.user.id;
    }

    if (farm) query.farm = farm;
    if (category) query.category = category;
    if (season) query.season = season;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } },
        { fieldPlot: { $regex: search, $options: 'i' } },
      ];
    }

    const crops = await Crop.find(query)
      .populate('farm', 'name location totalArea soilType')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: crops.length,
      crops,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
// @access  Private
const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'name location soilType irrigationType');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    // Ownership check
    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this crop record',
      });
    }

    // Fetch related activities for this crop
    const activities = await CropActivity.find({ crop: crop._id }).sort('scheduledDate');

    res.status(200).json({
      success: true,
      crop,
      activities,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new crop record
// @route   POST /api/crops
// @access  Private
const createCrop = async (req, res, next) => {
  try {
    const {
      farm,
      name,
      variety,
      category,
      season,
      fieldPlot,
      areaAllocated,
      areaUnit,
      plantingDate,
      expectedHarvestDate,
      growthStage,
      healthStatus,
      irrigationSchedule,
      expectedYield,
      notes,
    } = req.body;

    // Verify farm ownership
    const farmRecord = await Farm.findById(farm);
    if (!farmRecord) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    if (farmRecord.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only add crops to your own farms',
      });
    }

    // Estimate progress % based on growth stage
    const stageProgressMap = {
      Germination: 10,
      Vegetative: 30,
      Flowering: 55,
      Fruiting: 75,
      Maturity: 90,
      Harvested: 100,
    };

    const initialProgress = stageProgressMap[growthStage] || 15;

    const crop = await Crop.create({
      farmer: req.user.id,
      farm,
      name,
      variety: variety || '',
      category: category || 'Cereal',
      season: season || 'Kharif',
      fieldPlot: fieldPlot || 'Plot 1',
      areaAllocated: areaAllocated || 1,
      areaUnit: areaUnit || 'acres',
      plantingDate,
      expectedHarvestDate,
      growthStage: growthStage || 'Germination',
      growthProgressPercentage: initialProgress,
      healthStatus: healthStatus || 'Good',
      irrigationSchedule: irrigationSchedule || {
        frequencyDays: 4,
        nextIrrigationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      expectedYield: expectedYield || { amount: 0, unit: 'Quintals' },
      notes: notes || '',
    });

    // Auto-create initial calendar reminders
    const plantingTime = new Date(plantingDate).getTime();
    await CropActivity.create([
      {
        farmer: req.user.id,
        farm,
        crop: crop._id,
        title: `First Irrigation & Weeding for ${name}`,
        activityType: 'Irrigation',
        scheduledDate: new Date(plantingTime + 4 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        priority: 'High',
      },
      {
        farmer: req.user.id,
        farm,
        crop: crop._id,
        title: `Basal / Top-Dressing Fertilizer for ${name}`,
        activityType: 'Fertilization',
        scheduledDate: new Date(plantingTime + 21 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        priority: 'Medium',
      },
      {
        farmer: req.user.id,
        farm,
        crop: crop._id,
        title: `Pest & Fungal Scouting for ${name}`,
        activityType: 'Scouting',
        scheduledDate: new Date(plantingTime + 35 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        priority: 'Medium',
      },
      {
        farmer: req.user.id,
        farm,
        crop: crop._id,
        title: `Harvesting Window for ${name}`,
        activityType: 'Harvesting',
        scheduledDate: new Date(expectedHarvestDate),
        status: 'Pending',
        priority: 'High',
      },
    ]);

    // Send notification
    await Notification.create({
      recipient: req.user.id,
      title: 'New Crop Added',
      message: `Successfully registered crop '${name}' in farm '${farmRecord.name}'. Calendar reminders have been created.`,
      type: 'Irrigation',
      link: `/crops/${crop._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Crop record created successfully with farm schedule reminders',
      crop,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update crop record
// @route   PUT /api/crops/:id
// @access  Private
const updateCrop = async (req, res, next) => {
  try {
    let crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this crop',
      });
    }

    // Auto-sync progress percentage if growth stage changed
    if (req.body.growthStage && req.body.growthStage !== crop.growthStage) {
      const stageProgressMap = {
        Germination: 15,
        Vegetative: 35,
        Flowering: 60,
        Fruiting: 80,
        Maturity: 95,
        Harvested: 100,
      };
      req.body.growthProgressPercentage = stageProgressMap[req.body.growthStage] || crop.growthProgressPercentage;
      if (req.body.growthStage === 'Harvested') {
        req.body.status = 'Harvested';
        req.body.actualHarvestDate = new Date();
      }
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      crop,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a fertilizer application record to crop
// @route   POST /api/crops/:id/fertilizer
// @access  Private
const addFertilizerRecord = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const { fertilizerName, quantity, method, notes, date } = req.body;

    crop.fertilizerRecords.push({
      fertilizerName,
      quantity,
      method: method || 'Broadcasting',
      notes: notes || '',
      date: date || new Date(),
    });

    await crop.save();

    res.status(200).json({
      success: true,
      message: 'Fertilizer record added successfully',
      crop,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a crop
// @route   DELETE /api/crops/:id
// @access  Private
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this crop',
      });
    }

    await CropActivity.deleteMany({ crop: crop._id });
    await crop.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Crop record and associated activities deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reference crop library
// @route   GET /api/crops/reference/database
// @access  Public/Private
const getReferenceCropDatabase = (req, res) => {
  res.status(200).json({
    success: true,
    notice: 'Curated agricultural reference knowledge. Not a substitute for localized agronomic testing.',
    count: referenceCropDatabase.length,
    crops: referenceCropDatabase,
  });
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  addFertilizerRecord,
  deleteCrop,
  getReferenceCropDatabase,
};
