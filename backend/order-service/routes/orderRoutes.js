const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getUserOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../../shared/middlewares/auth');

// All order routes are protected
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin and restaurant owner routes
router.get('/', authorize('admin', 'restaurant_owner'), getOrders);
router.put('/:id/status', authorize('admin', 'restaurant_owner'), updateOrderStatus);

module.exports = router;