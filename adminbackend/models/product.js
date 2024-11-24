
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0},
    
    availability: { type: String, enum: ['Available', 'Not Available'], default: 'Available' }
});



module.exports = mongoose.model('Products', productSchema);
