const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Seeds',
        'Fertilizers',
        'Agricultural Tools',
        'Irrigation Equipment',
        'Organic Farming Supplies',
        'Crop Protection Products',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: 'pack', // e.g., '1 kg', '5 kg', 'piece', 'liter'
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    },
    brand: {
      type: String,
      default: 'AgriTech Select',
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewsCount: {
      type: Number,
      default: 12,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
