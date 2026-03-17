const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
    try {
        const { cuisine, city, search } = req.query;
        let query = {};

        // Filter by cuisine
        if (cuisine) {
            query.cuisine = { $in: cuisine.split(',') };
        }

        // Filter by city
        if (city) {
            query['address.city'] = city;
        }

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const restaurants = await Restaurant.find(query)
            .populate('ownerId', 'firstName lastName email')
            .sort({ rating: -1 });

        res.json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        console.error('Error getting restaurants:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching restaurants',
            error: error.message 
        });
    }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id)
            .populate('ownerId', 'firstName lastName email');

        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            });
        }

        // Get menu items for this restaurant
        const menuItems = await MenuItem.find({ restaurantId: req.params.id });

        res.json({
            success: true,
            data: {
                ...restaurant.toObject(),
                menu: menuItems
            }
        });
    } catch (error) {
        console.error('Error getting restaurant:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching restaurant',
            error: error.message 
        });
    }
};

// @desc    Create a restaurant
// @route   POST /api/restaurants
// @access  Private (restaurant_owner, admin)
const createRestaurant = async (req, res) => {
    try {
        const { name, description, cuisine, address, contact, imageUrl } = req.body;

        const restaurant = await Restaurant.create({
            name,
            description,
            cuisine,
            address,
            contact,
            imageUrl,
            ownerId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Restaurant created successfully',
            data: restaurant
        });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating restaurant',
            error: error.message 
        });
    }
};

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (owner only)
const updateRestaurant = async (req, res) => {
    try {
        let restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            });
        }

        // Check ownership
        if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this restaurant' 
            });
        }

        restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Restaurant updated successfully',
            data: restaurant
        });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating restaurant',
            error: error.message 
        });
    }
};

// @desc    Delete a restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (owner only)
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            });
        }

        // Check ownership
        if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this restaurant' 
            });
        }

        // Delete all menu items for this restaurant
        await MenuItem.deleteMany({ restaurantId: req.params.id });
        
        // Delete restaurant
        await restaurant.deleteOne();

        res.json({
            success: true,
            message: 'Restaurant and its menu items deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting restaurant',
            error: error.message 
        });
    }
};

// @desc    Get menu items for a restaurant
// @route   GET /api/restaurants/:id/menu
// @access  Public
const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ 
            restaurantId: req.params.id,
            isAvailable: true 
        }).sort({ category: 1, name: 1 });

        // Group by category
        const groupedMenu = menuItems.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});

        res.json({
            success: true,
            data: groupedMenu
        });
    } catch (error) {
        console.error('Error getting menu items:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching menu items',
            error: error.message 
        });
    }
};

// @desc    Add menu item to restaurant
// @route   POST /api/restaurants/:id/menu
// @access  Private (owner only)
const addMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            });
        }

        // Check ownership
        if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to add items to this restaurant' 
            });
        }

        const menuItem = await MenuItem.create({
            ...req.body,
            restaurantId: req.params.id
        });

        res.status(201).json({
            success: true,
            message: 'Menu item added successfully',
            data: menuItem
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding menu item',
            error: error.message 
        });
    }
};

// @desc    Update menu item
// @route   PUT /api/restaurants/menu/:itemId
// @access  Private (owner only)
const updateMenuItem = async (req, res) => {
    try {
        let menuItem = await MenuItem.findById(req.params.itemId);

        if (!menuItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Menu item not found' 
            });
        }

        // Check restaurant ownership
        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this item' 
            });
        }

        menuItem = await MenuItem.findByIdAndUpdate(
            req.params.itemId,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Menu item updated successfully',
            data: menuItem
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating menu item',
            error: error.message 
        });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/restaurants/menu/:itemId
// @access  Private (owner only)
const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.itemId);

        if (!menuItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Menu item not found' 
            });
        }

        // Check restaurant ownership
        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this item' 
            });
        }

        await menuItem.deleteOne();

        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting menu item',
            error: error.message 
        });
    }
};

module.exports = {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
};