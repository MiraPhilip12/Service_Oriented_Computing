const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    imageUrl: String,
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: true 
    },
    isAvailable: { type: Boolean, default: true },
    preparationTime: Number
});

module.exports = mongoose.model('MenuItem', menuItemSchema);