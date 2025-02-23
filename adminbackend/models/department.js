const mongoose = require('mongoose');

const DeptSchema = new mongoose.Schema({
    name:{type:String, required:true},

  
});



module.exports = mongoose.model('Departments', DeptSchema);