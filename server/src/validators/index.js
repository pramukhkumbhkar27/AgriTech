const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['farmer', 'expert'])
    .withMessage('Role must be either farmer or expert. Admin accounts cannot be self-registered.'),
  handleValidationErrors,
];

const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const farmValidator = [
  body('name').trim().notEmpty().withMessage('Farm name is required'),
  body('location.city').trim().notEmpty().withMessage('City / Village is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('totalArea').isFloat({ min: 0.01 }).withMessage('Total area must be greater than 0'),
  body('areaUnit')
    .optional()
    .isIn(['acres', 'hectares', 'bigha'])
    .withMessage('Invalid area unit'),
  handleValidationErrors,
];

const cropValidator = [
  body('farm').isMongoId().withMessage('Valid farm ID is required'),
  body('name').trim().notEmpty().withMessage('Crop name is required'),
  body('plantingDate').isISO8601().withMessage('Valid planting date is required'),
  body('expectedHarvestDate').isISO8601().withMessage('Valid expected harvest date is required'),
  handleValidationErrors,
];

const soilTestValidator = [
  body('farm').isMongoId().withMessage('Valid farm ID is required'),
  body('ph').isFloat({ min: 0, max: 14 }).withMessage('Soil pH must be between 0 and 14'),
  body('nitrogen').isFloat({ min: 0 }).withMessage('Nitrogen (N) must be a positive number'),
  body('phosphorus').isFloat({ min: 0 }).withMessage('Phosphorus (P) must be a positive number'),
  body('potassium').isFloat({ min: 0 }).withMessage('Potassium (K) must be a positive number'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  registerValidator,
  loginValidator,
  farmValidator,
  cropValidator,
  soilTestValidator,
};
