const express = require("express");
const { addProduct, getProducts,updateProduct,deleteProduct } = require("../controllers/warehouse");
const upload = require("../controllers/upload");
const router = express.Router();


router.post("/add-product", upload.single("image"), addProduct);

  
router.get('/products', getProducts);
router.put("/:id", upload.single("image"), updateProduct);
router.delete('/:id', deleteProduct);


module.exports = router;