const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    cuisine: [String],
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    contact: {
        phone: String,
        email: String
    },
    rating: { type: Number, default: 0 },
    imageUrl: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);