const Order = require('../models/Order');
const { generateOrderNumber, calculateDeliveryFee } = require('../../shared/utils/helpers');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const {
            restaurantId,
            items,
            deliveryAddress,
            paymentMethod,
            specialInstructions
        } = req.body;

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const deliveryFee = 5.00; // Fixed fee for now
        const total = subtotal + tax + deliveryFee;

        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            userId: req.user.id,
            restaurantId,
            items,
            subtotal,
            tax,
            deliveryFee,
            total,
            deliveryAddress,
            paymentMethod,
            specialInstructions,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating order',
            error: error.message 
        });
    }
};

// @desc    Get all orders (admin/restaurant owner)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const { status, restaurantId } = req.query;
        let query = {};

        if (status) query.status = status;
        if (restaurantId) query.restaurantId = restaurantId;

        const orders = await Order.find(query)
            .populate('userId', 'firstName lastName email')
            .populate('restaurantId', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching orders',
            error: error.message 
        });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('restaurantId', 'name imageUrl')
            .sort('-createdAt');

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error getting user orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching orders',
            error: error.message 
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'firstName lastName email phone')
            .populate('restaurantId', 'name address contact');

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Check if user is authorized to view this order
        if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to view this order' 
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching order',
            error: error.message 
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        order.status = status;
        
        // If order is delivered, add delivery time
        if (status === 'delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating order',
            error: error.message 
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Check if user owns this order
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to cancel this order' 
            });
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Order cannot be cancelled at this stage' 
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error cancelling order',
            error: error.message 
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getUserOrders
};