
const Product = require('../models/product');
const multer = require("multer");
const path = require("path");




// Add product
const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Error adding product", error });
  }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure the "uploads" directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid overwriting files
  },
});

const upload = multer({ storage: storage });

// Add product with image handling
// const addProduct = async (req, res) => {
//   try {
//     const { name, quantity, date, description } = req.body;
//     const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

//     const newProduct = new Product({
//       name,
//       quantity,
//       date,
//       description,
//       imageUrl,
//     });

//     await newProduct.save();
//     res.status(201).json(newProduct);
//   } catch (error) {
//     res.status(400).json({ message: "Error adding product", error });
//   }
// };

// Get products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Error updating product", error });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting product", error });
  }
};

module.exports = {  addProduct, getProducts, updateProduct, deleteProduct };
