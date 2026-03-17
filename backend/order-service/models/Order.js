const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    quantity: Number,
    price: Number
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [orderItemSchema],
    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    total: Number,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'],
        default: 'pending'
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);