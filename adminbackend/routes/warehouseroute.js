const express = require("express");
const { addProduct, getProducts,updateProduct,deleteProduct } = require("../controllers/warehouse");

const router = express.Router();


router.post('/add-product', addProduct);
router.get('/products', getProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;