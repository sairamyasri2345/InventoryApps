import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";
import axios from "axios";

const Warehouse = ({ darkMode, filterText }) => {
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [sendProductModal, setSendProductModal] = useState(false);
  const [warehouseProjects, setWarehouseProjects] = useState([]);
  const [approvedCounts, setApprovedCounts] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentProductId, setCurrentProductId] = useState(null);
  const [selectedSite, setSelectedSite] = useState("");

  const [productData, setProductData] = useState({
    name: "",
  });

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setProductData({
      name: "",
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  //   // Fetch products from the database
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3003/api/warehouse/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchWarehouseProjects = async () => {
    try {
      const warehouseRes = await axios.get(
        "http://localhost:3003/api/projects/projects"
      );
      console.log("Warehouse Projects:", warehouseRes.data);
      setWarehouseProjects(warehouseRes.data);
    } catch (error) {
      console.error("Error fetching warehouse products:", error);
    }
  };
  const fetchAppliedProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3003/api/appliedProducts"
      );
      const appliedProducts = await response.data;
      console.log(appliedProducts, "prod");

      const counts = appliedProducts.reduce((acc, item) => {
        if (item.status.toLowerCase() === "approved") {
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
  const handleProductSelection = (e) => {
    const selectedProduct = warehouseProjects.find(
      (project) => project.name === e.target.value
    );

    if (selectedProduct) {
      setProductData({
        name: selectedProduct.name,
      });
    }
  };
  useEffect(() => {
    fetchProducts();
    fetchWarehouseProjects();
    fetchAppliedProducts();
  }, []);

  const handleSave = async () => {
    const errors = {};
    if (!productData.name) errors.name = "Product name is required.";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:3003/api/warehouse/${currentProductId}`,
          productData
        );
      } else {
        await axios.post(
          "http://localhost:3003/api/warehouse/add-product",
          productData
        );
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleSendProductModalShow = () => setSendProductModal(true);
  const handleSendProductModalClose = () => setSendProductModal(false);
  const handleEdit = (product) => {
    setEditMode(true);
    setCurrentProductId(product._id);
    setProductData({
      name: product.name,
    });
    handleShow();
  };
  const handleSendProduct = () => {
    console.log("Sending products to:", selectedSite);
    handleSendProductModalClose();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3003/api/warehouse/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(products.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = products.slice(startRow, startRow + rowsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
        <div className="d-flex justify-content-end gap-3">
          <button
            onClick={() => {
              setEditMode(false);
              handleShow();
            }}
            className="btn btn-success mb-4"
          >
            <i className="bi bi-plus-lg px-1"></i> Add Product
          </button>

          <button
            onClick={handleSendProductModalShow}
            className="btn btn-success mb-4"
          >
            <i className="bi bi-plus-lg px-1"></i> Send Products
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
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                />
                {validationErrors.name && (
                  <Form.Text className="text-danger">
                    {validationErrors.name}
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
        <Modal show={sendProductModal} onHide={handleSendProductModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Send Product to Site</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Select Project</Form.Label>
                <Form.Select name="name" onChange={handleProductSelection}>
                  <option value="">Select Project</option>
                  {warehouseProjects.map((project) => (
                    <option key={project._id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleSendProductModalClose}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSendProduct}>
              Send
            </Button>
          </Modal.Footer>
        </Modal>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">Product Name</th>

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
export default Warehouse;
