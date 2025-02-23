const Product = require("../models/project");

// Add product with image handling
const addProject = async (req, res) => {
  try {
    const { name,  date } = req.body;
   

    const newProduct = new Product({
      name,
      date
      

    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: "Error adding product", error });
  }
};

// Get products
const getProjects = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Update product
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Error updating product", error });
  }
};

// Delete product
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting product", error });
  }
};

module.exports = { addProject, getProjects, updateProject, deleteProject };
