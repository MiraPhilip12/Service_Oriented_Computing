const express = require('express');
const router = express.Router();
const {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    updateDeliveryStatus,
    getDeliveryByOrder,
    assignDeliveryPerson,
    updateDeliveryLocation
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../../shared/middlewares/auth');

// Protected routes
router.use(protect);

// Admin and delivery person routes
router.get('/', authorize('admin', 'delivery_person'), getDeliveries);
router.post('/', authorize('admin'), createDelivery);
router.put('/:id/assign', authorize('admin'), assignDeliveryPerson);

// Delivery person routes
router.put('/:id/status', authorize('delivery_person', 'admin'), updateDeliveryStatus);
router.put('/:id/location', authorize('delivery_person'), updateDeliveryLocation);

// Public (with auth) routes
router.get('/order/:orderId', getDeliveryByOrder);
router.get('/:id', getDeliveryById);

module.exports = router;