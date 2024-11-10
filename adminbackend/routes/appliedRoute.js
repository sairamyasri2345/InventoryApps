const express = require('express');
const router = express.Router();
const AppliedProduct = require('../models/appliedProduct');
const Product = require('../models/product');
const nodemailer = require('nodemailer');

const Employee=require("../models/employeeData")
// Apply a product
router.post('/apply', async (req, res) => {
  try {
    const { employeeID, employeeName, productID, quantity, date } = req.body;
    const product = await Product.findById(productID);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const appliedProduct = new AppliedProduct({
      employeeID,
      employeeName,
      productID,
      productName: product.name,
      quantity,
      date
    });
    await appliedProduct.save();
    res.status(201).json(appliedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch applied products for a specific employee
router.get('/:employeeID', async (req, res) => {
  try {
    const { employeeID } = req.params;
    const appliedProducts = await AppliedProduct.find({ employeeID });
    res.json(appliedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/apply/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, date } = req.body;
    const updatedProduct = await AppliedProduct.findByIdAndUpdate(
      id,
      { quantity, date },
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Applied product not found' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete('/apply/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await AppliedProduct.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ message: 'Applied product not found' });
    res.json({ message: 'Applied product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const appliedProducts = await AppliedProduct.find()

    res.status(200).json(appliedProducts);
  } catch (error) {
    console.error('Error fetching applied products:', error);
    res.status(500).json({ message: 'Server error. Unable to fetch applied products.' });
  }
});



// router.put('/update-status/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body; // New status value (approved, pending, not available)

//     // Update the status of the applied product in the database
//     const appliedProduct = await AppliedProduct.findByIdAndUpdate(id, { status }, { new: true });
//     if (!appliedProduct) {
//       return res.status(404).json({ message: 'Applied product not found' });
//     }

//     // Compose the email message based on the new status
//     let emailMessage = '';
//     switch (status) {
//       case 'approved':
//         emailMessage = `Congratulations! Your application for the product "${appliedProduct.productName}" has been approved.`;
//         break;
//       case 'not available':
//         emailMessage = `We regret to inform you that the product "${appliedProduct.productName}" you applied for is currently not available.`;
//         break;
//       case 'pending':
//         emailMessage = `Your application for the product "${appliedProduct.productName}" is still pending. Please check back later for updates.`;
//         break;
//       default:
//         emailMessage = `The status of your product application has been updated.`;
//         break;
//     }

//     // Send email notification to the employee
//     await sendEmail(Employee.email, emailMessage);
//     console.log(Employee.email,"email",Employee)

//     res.json({ message: 'Status updated and email sent', appliedProduct });
//   } catch (error) {
//     console.error("Error updating status:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

// Function to send email

router.put('/update-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    // Update the status of the applied product in the database
    const appliedProduct = await AppliedProduct.findByIdAndUpdate(id, { status }, { new: true });
    if (!appliedProduct) {
      return res.status(404).json({ message: 'Applied product not found' });
    }

    // Find the employee's email using the employeeID from the applied product
    const employee = await Employee.findOne({ employeeID: appliedProduct.employeeID });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Compose the email message based on the new status
    let emailMessage = '';
    switch (status) {
      case 'approved':
        emailMessage = `Congratulations! Your application for the product "${appliedProduct.productName}" has been approved.`;
        break;
      case 'not available':
        emailMessage = `We regret to inform you that the product "${appliedProduct.productName}" you applied for is currently not available.`;
        break;
      case 'pending':
        emailMessage = `Your application for the product "${appliedProduct.productName}" is still pending. Please check back later for updates.`;
        break;
      default:
        emailMessage = `The status of your product application has been updated.`;
        break;
    }

    // Send email notification to the employee
    await sendEmail(employee.email, emailMessage);
    console.log(employee.email, "email");

    res.json({ message: 'Status updated and email sent', appliedProduct });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: error.message });
  }
});


const sendEmail = (to, message) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
  port:465, 
  secure: true,
    auth: {
      user: 'usairamyasri@gmail.com',
      pass: 'hcabqbadxxewptmh',
    },
  });

  const mailOptions = {
    from: 'usairamyasri@gmail.com',
    to,
    subject: 'Product Application Status Update',
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = router;
