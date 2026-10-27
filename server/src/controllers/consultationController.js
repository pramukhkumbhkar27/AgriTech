const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get consultations (farmers see theirs; experts see assigned; admin sees all)
// @route   GET /api/consultations
// @access  Private
const getConsultations = async (req, res, next) => {
  try {
    const { status, urgency } = req.query;
    const query = {};

    if (req.user.role === 'farmer') {
      query.farmer = req.user.id;
    } else if (req.user.role === 'expert') {
      query.expert = req.user.id;
    }

    if (status) query.status = status;
    if (urgency) query.urgency = urgency;

    const consultations = await Consultation.find(query)
      .populate('farmer', 'name email phone location')
      .populate('expert', 'name email specialization experienceYears languages')
      .populate('farm', 'name location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: consultations.length,
      consultations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single consultation by ID
// @route   GET /api/consultations/:id
// @access  Private
const getConsultationById = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('farmer', 'name email phone location')
      .populate('expert', 'name email specialization experienceYears languages bio')
      .populate('farm', 'name location soilType');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    // Role check: farmer, assigned expert, or admin
    const isOwnerFarmer = consultation.farmer._id.toString() === req.user.id;
    const isAssignedExpert = consultation.expert._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerFarmer && !isAssignedExpert && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this consultation',
      });
    }

    res.status(200).json({
      success: true,
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit new consultation request
// @route   POST /api/consultations
// @access  Private (Farmer)
const createConsultation = async (req, res, next) => {
  try {
    const {
      expertId,
      farmId,
      cropName,
      topic,
      urgency,
      preferredDate,
      problemDescription,
    } = req.body;

    const expertUser = await User.findOne({ _id: expertId, role: 'expert', isActive: true });
    if (!expertUser) {
      return res.status(404).json({
        success: false,
        message: 'Selected agricultural expert was not found or is currently unavailable.',
      });
    }

    const consultation = await Consultation.create({
      farmer: req.user.id,
      expert: expertId,
      farm: farmId || null,
      cropName,
      topic: topic || 'Crop Health & Disease',
      urgency: urgency || 'Normal',
      preferredDate,
      problemDescription,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          changedAt: new Date(),
          comment: 'Consultation request submitted by farmer.',
          changedBy: req.user.id,
        },
      ],
    });

    // Notify expert
    await Notification.create({
      recipient: expertId,
      title: 'New Consultation Request Received',
      message: `Farmer ${req.user.name} requested consultation regarding '${cropName}' (${topic}).`,
      type: 'Consultation',
      link: `/consultations/${consultation._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully to expert',
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update consultation status (Accept / Reject)
// @route   PUT /api/consultations/:id/status
// @access  Private (Expert or Admin)
const updateConsultationStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    if (consultation.expert.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned expert can update consultation status',
      });
    }

    consultation.status = status;
    consultation.statusHistory.push({
      status,
      changedAt: new Date(),
      comment: comment || `Status updated to ${status}`,
      changedBy: req.user.id,
    });

    await consultation.save();

    // Notify farmer
    await Notification.create({
      recipient: consultation.farmer,
      title: `Consultation ${status}: ${consultation.cropName}`,
      message: `Your agricultural expert marked the consultation as '${status}'.`,
      type: 'Consultation',
      link: `/consultations/${consultation._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Consultation marked as ${status}`,
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Expert responds with advisory recommendations
// @route   PUT /api/consultations/:id/respond
// @access  Private (Expert or Admin)
const respondToConsultation = async (req, res, next) => {
  try {
    const { diagnosis, advice, suggestedTreatments } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    if (consultation.expert.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned expert can provide technical responses',
      });
    }

    consultation.expertResponse = {
      diagnosis: diagnosis || 'Field Assessment Completed',
      advice,
      suggestedTreatments: Array.isArray(suggestedTreatments) ? suggestedTreatments : [suggestedTreatments].filter(Boolean),
      respondedAt: new Date(),
    };
    consultation.status = 'Completed';

    consultation.statusHistory.push({
      status: 'Completed',
      changedAt: new Date(),
      comment: 'Expert provided technical agricultural solution.',
      changedBy: req.user.id,
    });

    await consultation.save();

    // Notify farmer
    await Notification.create({
      recipient: consultation.farmer,
      title: `Expert Advice Ready for ${consultation.cropName}`,
      message: `Your expert provided agronomic advice and treatment recommendations.`,
      type: 'Consultation',
      link: `/consultations/${consultation._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Advisory response provided and consultation completed successfully',
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConsultations,
  getConsultationById,
  createConsultation,
  updateConsultationStatus,
  respondToConsultation,
};
