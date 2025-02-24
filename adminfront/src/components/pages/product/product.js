import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";
import axios from "axios";

const ProductManagement = ({ darkMode, filterText }) => {
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const [approvedCounts, setApprovedCounts] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    quantity: "",
    date: "",
    description: "",
  });
  const [products, setProducts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentProductId, setCurrentProductId] = useState(null);
  const [warehouseProducts, setWarehouseProducts] = useState([]);
  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setProductData({
      name: "",
      quantity: "",
      date: "",
      description: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  // Fetch products from the database
  const fetchProducts = async () => {
    try {
      const productRes = await axios.get(
        "http://13.232.162.43/api/products/products"
      );

      const allProducts = [...productRes.data];

      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchWarehouseProducts = async () => {
    try {
      const warehouseRes = await axios.get(
        "http://13.232.162.43/api/warehouse/products"
      );
      console.log("Warehouse Products:", warehouseRes.data);
      setWarehouseProducts(warehouseRes.data);
    } catch (error) {
      console.error("Error fetching warehouse products:", error);
    }
  };

  const fetchAppliedProducts = async () => {
    try {
      const response = await axios.get(
        "http://13.232.162.43/api/appliedProducts"
      );
      const appliedProducts = await response.data;
      console.log(appliedProducts, "prod");

      const counts = appliedProducts.reduce((acc, item) => {
        if (
          item.status &&
          typeof item.status === "string" &&
          item.status.toLowerCase() === "approved"
        ) {
          acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
        }
        return acc;
      }, {});

      console.log(counts, "prod");
      setApprovedCounts(counts);

      console.log(counts, "prod");
    } catch (error) {
      console.error("Error fetching applied products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchWarehouseProducts();
    fetchAppliedProducts();
  }, []);

  const handleSave = async () => {
    const errors = {};
    if (!productData.name) errors.name = "Product name is required.";
    if (!productData.quantity || productData.quantity < 0)
      errors.quantity = "Valid quantity is required.";

    if (!productData.description)
      errors.description = "Description is required.";
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (editMode) {
        await axios.put(
          `http://13.232.162.43/api/products/${currentProductId}`,
          productData
        );
      } else {
        await axios.post(
          "http://13.232.162.43/api/products/add-product",
          productData
        );
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setCurrentProductId(product._id);
    setProductData({
      name: product.name,
      quantity: product.quantity,
      date: product.date
        ? new Date(product.date).toISOString().split("T")[0]
        : "",
      description: product.description,
    });
    handleShow();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://13.232.162.43/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(filterText.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(products.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = products.slice(startRow, startRow + rowsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleProductSelection = (e) => {
    const selectedProduct = warehouseProducts.find(
      (product) => product.name === e.target.value
    );

    if (selectedProduct) {
      setProductData({
        name: selectedProduct.name,
      });
    }
  };

  // Generate page range to show around current page
  const generatePageRange = () => {
    const pageRange = [];
    const rangeSize = 5; // Number of pages to show before and after current page
    const maxRange = Math.min(rangeSize, totalPages); // Max number of pages to display

    let startPage = Math.max(1, currentPage - Math.floor(rangeSize / 2));
    let endPage = Math.min(totalPages, startPage + rangeSize - 1);

    // Adjust startPage if there are fewer pages than the range size
    if (endPage - startPage < rangeSize - 1) {
      startPage = Math.max(1, endPage - rangeSize + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageRange.push(i);
    }

    return pageRange;
  };
  return (
    <div className={`container-fluid ${darkMode ? "dark-mode" : ""}`}>
      <div className="card p-3 m-3">
        <div className="d-flex justify-content-end">
          <button
            onClick={() => {
              setEditMode(false);
              handleShow();
            }}
            className="btn btn-success mb-4"
          >
            <i className="bi bi-plus-lg px-1"></i> Add Product
          </button>
        </div>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editMode ? "Edit Product" : "Add Product"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Select Product</Form.Label>
                <Form.Select name="name" onChange={handleProductSelection}>
                  <option value="">Select a Product</option>
                  {warehouseProducts.map((product) => (
                    <option key={product._id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={productData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                />
                {validationErrors.quantity && (
                  <Form.Text className="text-danger">
                    {validationErrors.quantity}
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={productData.date}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                />
                {validationErrors.description && (
                  <Form.Text className="text-danger">
                    {validationErrors.description}
                  </Form.Text>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="success" onClick={handleSave}>
              {editMode ? "Update Productpp" : "Add Product"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">Product Name</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Stock</th>
              <th className="text-center">Date</th>
              <th className="text-center">Description</th>
              <th className="text-center">Availability</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => {
              const approvedCount = approvedCounts[product.name] || 0;
              console.log(
                "Product:",
                product.name,
                "Approved Count:",
                approvedCount
              );
              const availableQuantity = product.quantity - approvedCount;
              console.log("Available Quantity:", availableQuantity);
              return (
                <tr key={product._id}>
                  <td className="text-center">{product.name}</td>
                  <td className="text-center">{product.quantity}</td>
                  <td className="text-center">{availableQuantity}</td>
                  <td className="text-center">
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="text-center">{product.description}</td>
                  <td className="text-center">
                    {availableQuantity > 0 ? (
                      <span className="badge bg-success">Available</span>
                    ) : (
                      <span className="badge bg-danger">Not Available</span>
                    )}
                  </td>
                  <td className="text-center">
                    <Button
                      variant="warning"
                      onClick={() => handleEdit(product)}
                      className="btn-sm "
                    >
                      <i className="bi bi-pen text-white"></i>
                    </Button>{" "}
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(product._id)}
                      className="btn-sm"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="pagination d-flex justify-content-center mt-3">
          <button
            className="page-item"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button
            className="page-item"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ❮
          </button>
          {generatePageRange().map((page) => (
            <button
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="page-item"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ❯
          </button>
          <button
            className="page-item"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
