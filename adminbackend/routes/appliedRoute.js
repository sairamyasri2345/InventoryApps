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


    const employee = await Employee.findOne({ employeeID });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }


    const appliedProduct = new AppliedProduct({
      employeeID,
      employeeName,
      productID,
      productName: product.name,
      quantity,
      date
    });
    await appliedProduct.save();
    const emailMessage =`
    <h3>Product Application Submitted</h3>
    <p><strong>Employee Email:</strong> ${employee.email}</p>
    <p><strong>Employee Name:</strong> ${employeeName}</p>
    <p><strong>Quantity:</strong> ${quantity}</p>
     <p><strong>Product ID:</strong> ${productID}</p>
      <p><strong>Product Name:</strong> ${product.name}</p>
    <p><strong>Date:</strong> ${date}</p>`
  ;
  await sendEmpemail(employee.email, emailMessage);
    res.status(201).json(appliedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const sendEmpemail = (to, message) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'atmoslifestyleinventory@gmail.com',
      pass: 'guchpatpjzrzwsxn',
    },
  });

  const mailOptions = {
    from: 'atmoslifestyleinventory@gmail.com',
    to: ['admin@atmoslifestyle.com', 'srikanthraja@atmoslifestyle.com'],
    subject: 'Product Application Submitted',
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

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
    const emailMessage = `
    <h3>Applied Product Updated</h3>
    <p><strong>Product Name:</strong> ${updatedProduct.productName}</p>
    <p><strong>Employee Name:</strong> ${updatedProduct.employeeName}</p>
    <p><strong>Updated Quantity:</strong> ${quantity}</p>
    <p><strong>Updated Date:</strong> ${date}</p>
  `;
  await sendAdminEmail(emailMessage);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

});

const sendAdminEmail = async (message) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'atmoslifestyleinventory@gmail.com',
      pass: 'guchpatpjzrzwsxn', 
    },
  });

  const mailOptions = {
    from: 'atmoslifestyleinventory@gmail.com',
    to: ['admin@atmoslifestyle.com', 'srikanthraja@atmoslifestyle.com'],
    subject: 'Product Application Edit/Delete Notification',
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

router.delete('/apply/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await AppliedProduct.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ message: 'Applied product not found' });
    const emailMessage = `
    <h3>Applied Product Deleted</h3>
    <p><strong>Product Name:</strong> ${deletedProduct.productName}</p>
    <p><strong>Employee Name:</strong> ${deletedProduct.employeeName}</p>
    <p><strong>Quantity:</strong> ${deletedProduct.quantity}</p>
  `;
  await sendAdminEmail(emailMessage); 
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
    // const employee = await Employee.findOne({ employeeID: appliedProduct.employeeID });
    // if (!employee) {
    //   return res.status(404).json({ message: 'Employee not found' });
    // }

    // Compose the email message based on the new status
    let emailMessage = '';
    switch (status) {
      case 'Approved':
        emailMessage = `Congratulations! Your application for the product "${appliedProduct.productName}" has been approved.`;
        break;
      case 'Rejected':
        emailMessage = `We regret to inform you that the product "${appliedProduct.productName}" is rejected`;
        break;
      
      default:
        emailMessage = `The status of your product application has been updated.`;
        break;
    }

    // Send email notification to the employee
    // await sendEmail(employee.email, emailMessage);  
    await sendEmail(emailMessage);
   

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
      user: 'atmoslifestyleinventory@gmail.com',
      pass: 'guchpatpjzrzwsxn',
    },
  });

  const mailOptions = {
    from: 'atmoslifestyleinventory@gmail.com',
    to:"admin@atmoslifestyle.com",
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

router.put('/delivery-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    // Update the delivery status in the database
    const appliedProduct = await AppliedProduct.findByIdAndUpdate(
      id,
      { deliveryStatus },
      { new: true }
    );

    if (!appliedProduct) {
      return res.status(404).json({ message: 'Applied product not found' });
    }
const employee = await Employee.findOne({ employeeID: appliedProduct.employeeID });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Compose the email message based on the new status
    let emailMessage = '';
    switch (status) {
      case 'Approved':
        emailMessage = `Congratulations! Your application for the product "${appliedProduct.productName}" has been approved.`;
        break;
      case 'Rejected':
        emailMessage = `We regret to inform you that the product "${appliedProduct.productName}" is Rejected.`;
        break;
   
      default:
        emailMessage = `The status of your product application has been updated.`;
        break;
    }
    await sendDeliveryEmail(employee.email,emailMessage);
    res.json({ message: 'Delivery status updated successfully', appliedProduct });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Server error. Unable to update delivery status.' });
  }
});
const sendDeliveryEmail = (to, message) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
  port:465, 
  secure: true,
    auth: {
      user: 'atmoslifestyleinventory@gmail.com',
      pass: 'guchpatpjzrzwsxn',
    },
  });

  const mailOptions = {
    from: 'atmoslifestyleinventory@gmail.com',
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
router.put('/received-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { receivedStatus } = req.body;

    // Update the received status in the database
    const appliedProduct = await AppliedProduct.findByIdAndUpdate(
      id,
      { receivedStatus },
      { new: true }
    );

    if (!appliedProduct) {
      return res.status(404).json({ message: 'Applied product not found' });
    }

    // Get the employee's details for the applied product
    const employee = await Employee.findOne({ employeeID: appliedProduct.employeeID });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Compose the email message for the admin
    const emailMessage = `
      <h3>Received Status Updated</h3>
      <p><strong>Product Name:</strong> ${appliedProduct.productName}</p>
      <p><strong>Employee Name:</strong> ${appliedProduct.employeeName}</p>
      <p><strong>Employee Email:</strong> ${employee.email}</p>
      <p><strong>Received Status:</strong> ${receivedStatus}</p>
    `;

    // Send the email notification to the admin
    await sendReceivedStatusEmail(emailMessage);

    res.json({ message: 'Received status updated and email sent successfully', appliedProduct });
  } catch (error) {
    console.error('Error updating received status:', error);
    res.status(500).json({ message: 'Server error. Unable to update received status.' });
  }
});

// Helper function to send email notification to the admin
const sendReceivedStatusEmail = async (message) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'atmoslifestyleinventory@gmail.com',
      pass: 'guchpatpjzrzwsxn',
    },
  });

  const mailOptions = {
    from: 'atmoslifestyleinventory@gmail.com',
    to: 'admin@atmoslifestyle.com',
    subject: 'Received Status Updated',
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};




module.exports = router;
