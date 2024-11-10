
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    // availableQuantity: { type: Number, required: true },
    availability: { type: String, enum: ['Available', 'Not Available'], default: 'Available' }
});

module.exports = mongoose.model('Products', productSchema);
