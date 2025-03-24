import React, { useState, useEffect } from "react"; 
import { Modal, Button, Table, Form } from "react-bootstrap";
import axios from "axios";

const Warehouse = ({ darkMode, filterText }) => {
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [editMode, setEditMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentProductId, setCurrentProductId] = useState(null);
  const [productData, setProductData] = useState({
    name: "",
    image: null,
  });
  
  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setProductData({
      name: "",
      image: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setProductData({ ...productData, image: files[0] });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://13.233.115.70:3003/api/warehouse/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    const errors = {};
    if (!productData.name) errors.name = "Product name is required.";
    if (!productData.image) errors.image = "Product image is required.";
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
  
    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("image", productData.image);
  
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };
  
      if (editMode) {
        await axios.put(
          `http://13.233.115.70:3003/api/warehouse/${currentProductId}`,
          formData,
          config
        );
      } else {
        await axios.post(
          "http://13.233.115.70:3003/api/warehouse/add-product",
          formData,
          config
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
      image: null,
    });
    handleShow();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://13.233.115.70:3003/api/warehouse/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(products.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = products.slice(startRow, startRow + rowsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const generatePageRange = () => {
    const pageRange = [];
    const rangeSize = 5;
    const maxRange = Math.min(rangeSize, totalPages);
    let startPage = Math.max(1, currentPage - Math.floor(rangeSize / 2));
    let endPage = Math.min(totalPages, startPage + rangeSize - 1);

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
                  <Form.Text className="text-danger">{validationErrors.name}</Form.Text>
                )}
              </Form.Group>
              <Form.Group>
                <Form.Label>Product Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                />
                {validationErrors.image && (
                  <Form.Text className="text-danger">{validationErrors.image}</Form.Text>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button variant="success" onClick={handleSave}>
              {editMode ? "Update Product" : "Add Product"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Table bordered hover responsive>
          <thead>
            <tr>
            <th className="text-center">Product Image</th>
            <th className="text-center">Product Name</th>
          <th className="text-center">Actions</th>
          
            </tr>
          </thead>
          <tbody>
            {currentData.map((product) => (
              <tr key={product._id}>
                <td className="text-center">
                  {product.image && (
                    <img
                      src={`http://13.233.115.70:3003/${product.image}`}
                      alt={product.name}
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  )}
                </td>
                <td className="text-center">{product.name}</td>
             
                <td className="text-center">
       <Button variant="warning" onClick={() => handleEdit(product)} className="btn-sm">
         <i className="bi bi-pen text-white"></i>
        </Button>{" "}
       <Button variant="danger" onClick={() => handleDelete(product._id)} className="btn-sm">
          <i className="bi bi-trash"></i>
        </Button>
       </td>

              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Warehouse;
