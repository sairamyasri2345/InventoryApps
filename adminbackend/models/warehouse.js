
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String }, 

});



module.exports = mongoose.model('Warehouse', productSchema);
