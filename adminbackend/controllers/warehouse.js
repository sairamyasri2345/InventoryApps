const Product = require("../models/warehouse");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Add product
const addProduct = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : ""; // Store relative path
    const product = new Product({ ...req.body, image: imageUrl });
    await product.save();
    
    res.status(201).json({
      message: "Product added successfully",
      product: {
        ...product._doc,
        image: `http://localhost:3003${imageUrl}`, // Ensure image URL is correct
      },
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(400).json({ message: "Error adding product", error });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const updatedProducts = products.map(product => ({
      ...product._doc,
      image: product.image ? `http://localhost:3003${product.image}` : "", // Ensure full image URL
    }));

    res.json(updatedProducts);
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

module.exports = {
  addProduct: [upload.single("image"), addProduct],
  getProducts,
  updateProduct,
  deleteProduct,
};
