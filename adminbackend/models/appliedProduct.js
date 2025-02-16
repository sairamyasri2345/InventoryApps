const mongoose = require('mongoose');

const appliedProductSchema = new mongoose.Schema({
  employeeID: { type: String, required: true },
  employeeName: { type: String, required: true },
  productID: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, required: true },
  // employeeEmail: { type: String, required: true },
  status: { type: String, default: 'Requested' },
  deliveryStatus: { type: String, default: 'Pending' }, 
  receivedStatus:{type:String,default:"Pending"},
  appliedAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('AppliedProducts', appliedProductSchema);
