const express = require("express");
const router = express.Router();
const SendProduct = require("../models/sendproduct");

// Endpoint to store sent products
router.post('/sendProducts', async (req, res) => {
  try {
    const { name, quantity, sendProduct } = req.body;
   

    const newProduct = new SendProduct ({
      name,
      quantity,
   sendProduct
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: "Error adding product", error });
  }
});

// Get products
router.get('/', async (req, res) => {
  try {
    const products = await SendProduct .find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});
router.put('/sendProducts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await SendProduct.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Error updating product", error });
  }
});

// Delete product
router.delete('/sendProducts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await SendProduct.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting product", error });
  }
});
module.exports = router;
