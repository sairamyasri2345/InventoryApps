const Product = require("../models/warehouse");
const upload = require("../controllers/upload");
// Add product
const addProduct = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.path : null; // multer will provide the file path

    if (!name || !image) {
      return res.status(400).json({ message: "Name and image are required" });
    }

    const product = new Product({ name, image });
    await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product: product,
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
    const updatedProducts = products.map((product) => ({
      ...product._doc,
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
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
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
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
