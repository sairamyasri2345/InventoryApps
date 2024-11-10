
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    designation: { type: String, required: true },
    phonenumber:{type:String, require:true},
    department:{type:String, require:true}

});

module.exports = mongoose.model('Employee', employeeSchema);
