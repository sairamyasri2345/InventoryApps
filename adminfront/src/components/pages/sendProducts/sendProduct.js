import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sendsData, setSendsData] = useState({
    name: "",
    sendProduct: "",
    quantity: "",
  });

  const sendhandleShow = () => {
    setEditMode(false);
    setCurrentProductId(null);
    setSendsData({
      name: "",
      sendProduct: "",
      quantity: "",
    });
    setSelectedProducts([]); 
    setSendProductModal(true);
  };
  
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
      sendProduct: product.sendProduct.map((p) => p.productName),
    });
  
    setSelectedProducts(
      product.sendProduct.map((p) => ({
        name: p.productName,
        quantity: p.quantity
      }))
    );
  
    setSendProductModal(true);
  };
  
  

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3003/api/sendProducts/sendProducts/${id}`
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
  
    if (!sendsData.name) errors.name = "Project name is required.";
    if (selectedProducts.length === 0) errors.sendProduct = "Select at least one product.";
  
    selectedProducts.forEach((product, index) => {
      if (!product.quantity || parseInt(product.quantity) <= 0) {
        errors[`quantity${index}`] = "Valid quantity is required.";
      }
    });
  
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
  
    try {
      const payload = {
        name: sendsData.name,
        sendProduct: selectedProducts.map((product) => ({
          productName: product.name,
          quantity: parseInt(product.quantity, 10) || 0,
        })),
      };
  
      console.log("Sending Data:", payload);
  
      let response;
      if (editMode) {
        response = await axios.put(
          `http://localhost:3003/api/sendProducts/sendProducts/${currentProductId}`,
          payload
        );
      } else {
        response = await axios.post(
          "http://localhost:3003/api/sendProducts/sendProducts",
          payload
        );
      }
  
      // Update state instead of refetching data
      setSendProducts((prev) =>
        editMode
          ? prev.map((item) =>
              item._id === currentProductId ? response.data : item
            )
          : [...prev, response.data]
      );
      fetchSentProducts();
      fetchProducts()
      handleSendProductModalClose();
    } catch (error) {
      console.error("Error sending product data:", error.response?.data || error);
    }
  };
  
  
  
  

  const handleSendProductModalShow = () => setSendProductModal(true);
  const handleSendProductModalClose = () => setSendProductModal(false);

  const filteredProducts = sendproducts.filter((product) =>
    product.name?.toLowerCase().includes(filterText?.toLowerCase())
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
  const handleCheckboxChange = (product) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.some((p) => p._id === product._id);
      if (isSelected) {
        return prevSelected.filter((p) => p._id !== product._id);
      } else {
        return [...prevSelected, { ...product, quantity: 1 }];
      }
    });
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
  <Form.Select 
    name="name" 
    value={sendsData.name} 
    onChange={handleProductSelection}
  >
    <option value="">Select Project</option>
    {warehouseProjects.map((project) => (
      <option key={project._id} value={project.name}>
        {project.name}
      </option>
    ))}
  </Form.Select>
</Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Select Products</Form.Label>
                {sendsProjects.map((product) => (
                  <Form.Check
                    key={product._id}
                    type="checkbox"
                    label={product.name}
                    checked={selectedProducts.some((p) => p._id === product._id)}
                    onChange={() => {handleCheckboxChange(product)
                     
                    }}

                  />
                ))}
                 <Form.Control
    type="hidden"
    name="sendProduct"
    value={sendsData.sendProduct}  />
              </Form.Group>
              {selectedProducts.map((product, index) => (
           <Form.Group key={product._id} className="mb-2">
           <Form.Label>{product.name} Quantity</Form.Label>
           <Form.Control
             type="number"
             name={`quantity${index}`}
             value={product.quantity || ""}
             onChange={(e) => {
               const newQuantity = e.target.value;
               setSelectedProducts((prevSelected) =>
                 prevSelected.map((p) =>
                   p._id === product._id ? { ...p, quantity: newQuantity } : p
                 )
               );
             }}
             placeholder="Enter quantity"
           />
           {validationErrors[`quantity${index}`] && (
             <Form.Text className="text-danger">
               {validationErrors[`quantity${index}`]}
             </Form.Text>
           )}
         </Form.Group>
         
                  ))}
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
 
          {currentData.map((product, index) => (
      <tr key={product._id}>
     
    
        <td className="text-center">{product.name}</td>
        <td className="text-center">{product.sendProduct?.map(p => p.productName).join(", ")}</td>
        <td className="text-center"> 
  <OverlayTrigger
    placement="top"
    overlay={
      <Tooltip>
        {product.sendProduct?.length > 0
          ? product.sendProduct.map((p) => p.productName).join(", ")
          : "No product assigned"}
      </Tooltip>
    }
  >
    <span className="quantity-cell">
      {product.sendProduct?.length > 0 ? product.sendProduct.map((p) => p.quantity).join(", ") : "0"}
    </span>
  </OverlayTrigger>
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
    
      ))}
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
