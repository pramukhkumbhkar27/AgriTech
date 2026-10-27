const Product = require('../models/Product');

// @desc    Get all marketplace products with filtering & search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, organicOnly, sort } = req.query;

    const query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (organicOnly === 'true') {
      query.isOrganic = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    let sortBy = '-createdAt';
    if (sort === 'price-asc') sortBy = 'price';
    if (sort === 'price-desc') sortBy = '-price';
    if (sort === 'rating') sortBy = '-rating';
    if (sort === 'popular') sortBy = '-reviewsCount';

    const products = await Product.find(query).sort(sortBy);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      price,
      originalPrice,
      unit,
      stockQuantity,
      imageUrl,
      brand,
      isOrganic,
    } = req.body;

    const product = await Product.create({
      name,
      category,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.15,
      unit: unit || 'pack',
      stockQuantity: Number(stockQuantity) || 10,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      brand: brand || 'AgriTech Select',
      isOrganic: Boolean(isOrganic),
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
