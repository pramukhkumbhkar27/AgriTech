const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);

router.route('/')
  .get(getMyOrders)
  .post(createOrder);

router.get('/admin/all', authorize('admin'), getAllOrdersAdmin);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
