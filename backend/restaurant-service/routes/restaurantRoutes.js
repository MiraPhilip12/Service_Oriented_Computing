const express = require('express');
const router = express.Router();
const {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../../shared/middlewares/auth');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getMenuItems);

// Protected routes (restaurant owners and admin only)
router.post('/', protect, authorize('restaurant_owner', 'admin'), createRestaurant);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), updateRestaurant);
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), deleteRestaurant);

// Menu routes
router.post('/:id/menu', protect, authorize('restaurant_owner', 'admin'), addMenuItem);
router.put('/menu/:itemId', protect, authorize('restaurant_owner', 'admin'), updateMenuItem);
router.delete('/menu/:itemId', protect, authorize('restaurant_owner', 'admin'), deleteMenuItem);

module.exports = router;