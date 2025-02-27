import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";
import axios from "axios";

const SendProduct = ({ darkMode, filterText }) => {
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [sendProductModal, setSendProductModal] = useState(false);
  const [warehouseProjects, setWarehouseProjects] = useState([]);
  const [sendsProjects, setSendsProjects] = useState([]);
  const [approvedCounts, setApprovedCounts] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [sendproducts, setSendProducts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentProductId, setCurrentProductId] = useState(null);
  const [selectedSite, setSelectedSite] = useState("");
  const [sendsData, setSendsData] = useState({
    name: "",
    sendProduct: "",
    quantity: "",
  });

  const sendhandleShow = () => setSendProductModal(true);
  const handleClose = () => {
    setSendProductModal(false);
    setSendsData({
      name: "",
      sendProduct: "",
      quantity: "",
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSendsData({ ...sendsData, [name]: value });
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3003/api/warehouse/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSendsProjects(response.data);
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

  const handleProductSelection = (e) => {
    const selectedProduct = warehouseProjects.find(
      (project) => project.name === e.target.value
    );

    if (selectedProduct) {
      setSendsData({
        name: selectedProduct.name,
      });
    }
  };
  const fetchSentProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3003/api/sendProducts",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSendProducts(response.data);
    } catch (error) {
      console.error("Error fetching sent products:", error);
    }
  };

  const handlesendSelection = (e) => {
    const selectedProduct = sendsProjects.find(
      (product) => product.name === e.target.value
    );

    if (selectedProduct) {
      setSendsData((prevData) => ({
        ...prevData,
        sendProduct: selectedProduct.name,
      }));
    }
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setCurrentProductId(product._id);
    setSendsData({
      name: product.name,
    });

    sendhandleShow();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3003/api/sendProducts/${id}`
      );
      fetchSentProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
    fetchSentProducts();
    fetchWarehouseProjects();
  }, []);

  const sendHandleSave = async () => {
    const errors = {};

    if (!sendsData.name) errors.name = "Product name is required.";
    if (!sendsData.quantity || parseInt(sendsData.quantity) <= 0)
      errors.quantity = "Valid quantity is required.";
    if (!sendsData.sendProduct)
      errors.sendProduct = "Project Name is required.";

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      return;
    }

    try {
      console.log("Sending Data:", sendsData);
      if (editMode) {
        await axios.put(
          `http://localhost:3003/api/sendProducts/sendProducts/${currentProductId}`,
          sendsData
        );
      } else {
        await axios.post(
          "http://localhost:3003/api/sendProducts/sendProducts",
          sendsData
        );
      }

      setSendProducts([...sendproducts, sendsData]);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3003/api/sendProducts/sendProducts",
        sendsData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      fetchProducts();
      handleSendProductModalClose();
    } catch (error) {
      console.error("Error sending product data:", error);
    }
  };

  // const handleSave = async () => {
  //   const errors = {};
  //   if (!productData.name) errors.name = "Product name is required.";

  //   setValidationErrors(errors);
  //   if (Object.keys(errors).length > 0) return;
  //   try {
  //     if (editMode) {
  //       await axios.put(
  //         `http://localhost:3003/api/warehouse/${currentProductId}`,
  //         productData
  //       );
  //     } else {
  //       await axios.post(
  //         "http://localhost:3003/api/warehouse/add-product",
  //         productData
  //       );
  //     }
  //     fetchProducts();
  //     handleClose();
  //   } catch (error) {
  //     console.error("Error saving product:", error);
  //   }
  // };

  const handleSendProductModalShow = () => setSendProductModal(true);
  const handleSendProductModalClose = () => setSendProductModal(false);

  // const handleSendProduct = async () => {
  //   console.log("Sending product details:", productData);

  //   await sendHandleSave();
  // };

  const filteredProducts = sendproducts.filter((product) =>
    product.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(sendproducts.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = sendproducts.slice(startRow, startRow + rowsPerPage);

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
              sendhandleShow();
            }}
            className="btn btn-success mb-4"
          >
            <i className="bi bi-plus-lg px-1"></i> Send Products
          </button>
        </div>

        <Modal show={sendProductModal} onHide={handleSendProductModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Send Product to Site</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
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
              <Form.Group className="mb-2">
                <Form.Label>Select Product</Form.Label>
                <Form.Select name="sendProduct" onChange={handlesendSelection}>
                  <option value="">Select Product</option>
                  {sendsProjects.map((project) => (
                    <option key={project._id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={sendsData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                />
                {validationErrors.quantity && (
                  <Form.Text className="text-danger">
                    {validationErrors.quantity}
                  </Form.Text>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleSendProductModalClose}>
              Cancel
            </Button>
            <Button variant="success" onClick={sendHandleSave}>
              Send
            </Button>
          </Modal.Footer>
        </Modal>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">Product Name</th>
              <th className="text-center">Project Name</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => {
              const approvedCount = approvedCounts[product.name] || 0;

              return (
                <tr key={product._id}>
                  <td className="text-center">{product.name}</td>
                  <td className="text-center">{product.sendProduct}</td>
                  <td className="text-center">{product.quantity}</td>
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
export default SendProduct;
