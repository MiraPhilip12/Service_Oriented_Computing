const Delivery = require('../models/Delivery');

// @desc    Create new delivery
// @route   POST /api/delivery
// @access  Private/Admin
const createDelivery = async (req, res) => {
    try {
        const { orderId, pickupLocation, deliveryLocation, estimatedDeliveryTime } = req.body;

        // Check if delivery already exists for this order
        const existingDelivery = await Delivery.findOne({ orderId });
        if (existingDelivery) {
            return res.status(400).json({ 
                success: false, 
                message: 'Delivery already exists for this order' 
            });
        }

        const delivery = await Delivery.create({
            orderId,
            pickupLocation,
            deliveryLocation,
            estimatedDeliveryTime,
            status: 'assigned'
        });

        res.status(201).json({
            success: true,
            message: 'Delivery created successfully',
            data: delivery
        });
    } catch (error) {
        console.error('Error creating delivery:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating delivery',
            error: error.message 
        });
    }
};

// @desc    Get all deliveries
// @route   GET /api/delivery
// @access  Private/Admin
const getDeliveries = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) query.status = status;

        const deliveries = await Delivery.find(query)
            .populate('orderId')
            .populate('deliveryPersonId', 'firstName lastName email phone')
            .sort('-createdAt');

        res.json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    } catch (error) {
        console.error('Error getting deliveries:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching deliveries',
            error: error.message 
        });
    }
};

// @desc    Get delivery by ID
// @route   GET /api/delivery/:id
// @access  Private
const getDeliveryById = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .populate('orderId')
            .populate('deliveryPersonId', 'firstName lastName email phone');

        if (!delivery) {
            return res.status(404).json({ 
                success: false, 
                message: 'Delivery not found' 
            });
        }

        res.json({
            success: true,
            data: delivery
        });
    } catch (error) {
        console.error('Error getting delivery:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching delivery',
            error: error.message 
        });
    }
};

// @desc    Get delivery by order ID
// @route   GET /api/delivery/order/:orderId
// @access  Private
const getDeliveryByOrder = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({ orderId: req.params.orderId })
            .populate('deliveryPersonId', 'firstName lastName phone');

        if (!delivery) {
            return res.status(404).json({ 
                success: false, 
                message: 'Delivery not found for this order' 
            });
        }

        res.json({
            success: true,
            data: delivery
        });
    } catch (error) {
        console.error('Error getting delivery by order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching delivery',
            error: error.message 
        });
    }
};

// @desc    Assign delivery person to delivery
// @route   PUT /api/delivery/:id/assign
// @access  Private/Admin
const assignDeliveryPerson = async (req, res) => {
    try {
        const { deliveryPersonId } = req.body;

        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ 
                success: false, 
                message: 'Delivery not found' 
            });
        }

        delivery.deliveryPersonId = deliveryPersonId;
        delivery.status = 'assigned';
        await delivery.save();

        res.json({
            success: true,
            message: 'Delivery person assigned successfully',
            data: delivery
        });
    } catch (error) {
        console.error('Error assigning delivery person:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error assigning delivery person',
            error: error.message 
        });
    }
};

// @desc    Update delivery status
// @route   PUT /api/delivery/:id/status
// @access  Private/Delivery Person
const updateDeliveryStatus = async (req, res) => {
    try {
        const { status, currentLocation } = req.body;

        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ 
                success: false, 
                message: 'Delivery not found' 
            });
        }

        // Check if delivery person is assigned to this delivery
        if (delivery.deliveryPersonId?.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this delivery' 
            });
        }

        delivery.status = status;

        // Update location if provided
        if (currentLocation) {
            delivery.currentLocation = currentLocation;
        }

        // If delivered, set actual delivery time
        if (status === 'delivered') {
            delivery.actualDeliveryTime = Date.now();
        }

        await delivery.save();

        res.json({
            success: true,
            message: 'Delivery status updated successfully',
            data: delivery
        });
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating delivery status',
            error: error.message 
        });
    }
};

// @desc    Update delivery location
// @route   PUT /api/delivery/:id/location
// @access  Private/Delivery Person
const updateDeliveryLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;

        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ 
                success: false, 
                message: 'Delivery not found' 
            });
        }

        // Check if delivery person is assigned to this delivery
        if (delivery.deliveryPersonId?.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this delivery' 
            });
        }

        delivery.currentLocation = { lat, lng };
        await delivery.save();

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: { currentLocation: delivery.currentLocation }
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating location',
            error: error.message 
        });
    }
};

module.exports = {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    getDeliveryByOrder,
    assignDeliveryPerson,
    updateDeliveryStatus,
    updateDeliveryLocation
};