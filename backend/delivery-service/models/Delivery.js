const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true,
        unique: true 
    },
    deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['assigned', 'picked_up', 'in_transit', 'delivered'],
        default: 'assigned'
    },
    pickupLocation: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    deliveryLocation: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', deliverySchema);