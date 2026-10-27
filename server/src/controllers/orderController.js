const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @desc    Create demo order with rigorous server-side price and stock validation
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items specified in request',
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address and contact number are required',
      });
    }

    // Server-side price and stock check
    const validatedItems = [];
    let computedSubtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId || item.product} no longer exists.`,
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10));

      if (product.stockQuantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${product.name}. Available: ${product.stockQuantity}, Requested: ${qty}`,
        });
      }

      // Decrement inventory stock safely
      product.stockQuantity -= qty;
      await product.save();

      const itemTotal = product.price * qty;
      computedSubtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price, // enforced server price!
        quantity: qty,
        imageUrl: product.imageUrl,
        unit: product.unit,
      });
    }

    const shippingFee = computedSubtotal > 1500 ? 0 : 99; // Free delivery over ₹1500
    const totalAmount = computedSubtotal + shippingFee;
    const orderNumber = `AGT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      farmer: req.user.id,
      orderNumber,
      items: validatedItems,
      shippingAddress,
      paymentMethod: 'Demo Payment (Simulated Instant Approval)',
      paymentStatus: 'Paid (Demo)',
      orderStatus: 'Placed',
      subtotal: computedSubtotal,
      shippingFee,
      totalAmount,
      isDemoOrder: true,
      trackingNote: 'Order verified and queued for dispatch from nearest agricultural supply depot.',
    });

    // Create confirmation notification
    await Notification.create({
      recipient: req.user.id,
      title: 'Demo Order Placed Successfully',
      message: `Your order #${orderNumber} for ₹${totalAmount.toLocaleString()} has been placed via Demo Checkout.`,
      type: 'Order',
      link: `/marketplace/orders/${order._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Demo order processed successfully with verified inventory allocation',
      order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in farmer's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ farmer: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('farmer', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.farmer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, sort } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const orders = await Order.find(query).populate('farmer', 'name email phone').sort(sort || '-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status & tracking note (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingNote } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNote) order.trackingNote = trackingNote;

    await order.save();

    // Notify farmer of order update
    await Notification.create({
      recipient: order.farmer,
      title: `Order Status Update: #${order.orderNumber}`,
      message: `Your order status changed to '${orderStatus}'. ${trackingNote || ''}`,
      type: 'Order',
      link: `/marketplace/orders/${order._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
};
