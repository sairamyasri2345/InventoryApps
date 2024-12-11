import React, { useState, useEffect } from "react";
import axios from "axios";
import "./appliedPro.css";
import { toast } from "react-toastify";
import { Button, Modal, Form, Table } from "react-bootstrap";

const AppliedProducts = ({ userData, filterText }) => {
  const [appliedProducts, setAppliedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [availableQuantity, setAvailableQuantity] = useState(null);
  const [timeError, setTimeError] = useState("");
  const [approvedCounts, setApprovedCounts] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({});
  const rowsPerPage = 8;
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const employeeID = localStorage.getItem("employeeID");
  const TIME_LIMIT = 20*60*1000 ;
  const employeeName = localStorage.getItem("employeeName");

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3003/api/products/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchAllAppliedProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3003/api/appliedProducts/all"
      );
      setAppliedProducts(response.data);
    } catch (error) {
      console.error("Error fetching all applied products:", error);
    }
  };

  const fetchAppliedProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3003/api/appliedProducts/${employeeID}`
      );
      setAppliedProducts(response.data);
    } catch (error) {
      console.error("Error fetching applied products:", error);
    }
  };
  const validateFields = () => {
    const newErrors = {};
    if (!selectedProduct) newErrors.selectedProduct = "Please select a product";
    if (!quantity) newErrors.quantity = "Please enter quantity";
    if (!date) newErrors.date = "Please enter a date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAllAppliedProduct = async () => {
    try {
      const response = await axios.get("http://localhost:3003/api/appliedProducts");
      const appliedProducts = await response.data;
     console.log(appliedProducts,"prod")
      

      const counts = appliedProducts.reduce((acc, item) => {
        if (item.status.toLowerCase() === "approved") {
          acc[item.productName] =
            (acc[item.productName] || 0) + item.quantity;
        }
        return acc;
      }, {});
      console.log(counts,"prod")
      setApprovedCounts(counts);

    
      console.log(counts,"prod")
    } catch (error) {
      console.error("Error fetching applied products:", error);
    }
  };


//  const handleApplyProduct = async () => {
//   if (!validateFields()) return;

//   const product = products.find((p) => p._id === selectedProduct);
//   if (!product) {
//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       quantity: "Invalid product selected",
//     }));
//     return;
//   }

//   const availableQuantity = product.quantity;
//   console.log(availableQuantity,"quant")
//   if (parseInt(quantity) <= 0) {
//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       quantity: "Quantity must be greater than 0",
//     }));
//     return;
//   }

//   if (parseInt(quantity) > availableQuantity) {
//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       quantity: `You cannot apply for more than the available quantity (${availableQuantity})`,
//     }));
//     return;
//   }

//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.post(
//       "http://localhost:3003/api/appliedProducts/apply",
//       {
//         employeeID,
//         employeeName,
//         productID: selectedProduct,
//         quantity,
//         date,
//       },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     setAppliedProducts([...appliedProducts, response.data]);
//     setShowModal(false);
//     setSelectedProduct("");
//     setQuantity("");
//     setDate("");
//     setErrors({});
//   } catch (error) {
//     console.error("Error applying product:", error);
//   }
// };

const checkDisableState = (appliedAt) => {
  const elapsedTime = Date.now() - new Date(appliedAt).getTime();
  console.log(elapsedTime,"time")
 

  return elapsedTime >= 15 * 60 * 1000; 
};

  const handleFieldBlur = (field) => {
    if (!field) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: `Please enter ${field}`,
      }));
    }
  };

  const handleFieldChange = (field, value) => {
    if (errors[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    }
    if (field === "selectedProduct") setSelectedProduct(value);
    if (field === "quantity") setQuantity(value);
    if (field === "date") setDate(value);
  };
 
  useEffect(() => {
    fetchAppliedProducts();
    // fetchAllAppliedProducts();
    fetchProducts();
    fetchAllAppliedProduct()
  }, []);
  const handleDelete = async (productId,appliedDate) => {

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3003/api/appliedProducts/apply/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setAppliedProducts((prev) => prev.filter((prod) => prod._id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete the product");
    }
  };
  



 
  // Function to handle the edit action
  const handleEdit = (product) => {
  
    setEditProduct(product);
    setQuantity(product.quantity);
    setSelectedProduct(product.productID);
    setDate(product.date);
    setShowModal(true);
  };
  // const handleEdit = (product) => {
  //   setEditProduct(product);
  //   setSelectedProduct(product.productID || "");
  //   setQuantity(product.quantity || "");
  //   setDate(
  //     product.date ? new Date(product.date).toISOString().split("T")[0] : ""
  //   );
  //   setShowModal(true);
  // };

  
  // const handleDelete = async (id) => {
  //   try {
  //     await axios.delete(
  //       `http://localhost:3003/api/appliedProducts/apply/${id}`
  //     );
  //     setAppliedProducts(
  //       appliedProducts.filter((product) => product._id !== id)
  //     );
  //     toast.success("Product deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting applied product:", error);
  //   }
  // };
  // const handleSaveProduct = async () => {
  //   if (!validateFields()) return;
  
  //   // Ensure the quantity is greater than 0
  //   if (parseInt(quantity) <= 0) {
  //     setErrors((prevErrors) => ({
  //       ...prevErrors,
  //       quantity: "Quantity must be greater than 0",
  //     }));
  //     return; // Prevent the save action if quantity is invalid
  //   }
  
  //   try {
  //     const token = localStorage.getItem("token");
  
  //     if (editProduct) {
  //       // Update existing product
  //       await axios.put(
  //         `http://localhost:3003/api/appliedProducts/apply/${editProduct._id}`,
  //         {
  //           quantity,
  //           date,
  //         },
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  
  //       setAppliedProducts((prev) =>
  //         prev.map((prod) =>
  //           prod._id === editProduct._id ? { ...prod, quantity, date } : prod
  //         )
  //       );
  //     } else {
  //       // Create a new application
  //       const response = await axios.post(
  //         "http://localhost:3003/api/appliedProducts/apply",
  //         {
  //           employeeID,
  //           employeeName,
  //           productID: selectedProduct,
  //           quantity,
  //           date,
  //         },
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  
  //       setAppliedProducts([...appliedProducts, response.data]);
  //     }
  
  //     setShowModal(false);
  //     setEditProduct(null);
  //     setSelectedProduct("");
  //     setQuantity("");
  //     setDate("");
  //     setErrors({});
  //   } catch (error) {
  //     console.error("Error saving product:", error);
  //   }
  // };
  
  const handleSaveProduct = async () => {
    if (!validateFields()) return;
  
    const product = products.find((p) => p._id === selectedProduct);
  if (!product) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      quantity: "Invalid product selected",
    }));
    return;
  }
  const approvedCount =
  approvedCounts[product.name] || 0;
  console.log("Product:", product.name, "Approved Count:", approvedCount);
const availableQuantity =
  product.quantity - approvedCount;
  console.log("Available Quantity:", availableQuantity);


  if (parseInt(quantity) <= 0) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      quantity: "Quantity must be greater than 0",
    }));
    return;
  }

  if (parseInt(quantity) > availableQuantity && availableQuantity !== null ) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      quantity: `You cannot apply for more than the available quantity (${availableQuantity})`,
    }));
    return;
  }

  
    try {
      const token = localStorage.getItem("token");
  

  
      if (editProduct) {
        await axios.put(
          `http://localhost:3003/api/appliedProducts/apply/${editProduct._id}`,
          {
            quantity,
            date,
         
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setAppliedProducts((prev) =>
          prev.map((prod) =>
            prod._id === editProduct._id
              ? { ...prod, quantity, date}
              : prod
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:3003/api/appliedProducts/apply",
          {
            employeeID,
            employeeName,
            productID: selectedProduct,
            quantity,
            date,
  
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setAppliedProducts([...appliedProducts, response.data]);
      }
  
      setShowModal(false);
      setEditProduct(null);
      setSelectedProduct("");
      setQuantity("");
      setDate("");
      setErrors({});
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };
 


  const totalPages = Math.ceil(appliedProducts.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = appliedProducts.slice(startRow, startRow + rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setEditProduct(null);
    setSelectedProduct("");
    setQuantity("");
    setDate("");
    setErrors({});
  };

  // const generatePageRange = () => {
  //   const pageRange = [];
  //   const rangeSize = 5;
  //   const maxRange = Math.min(rangeSize, totalPages);
  //   let startPage = Math.max(1, currentPage - Math.floor(rangeSize / 2));
  //   let endPage = Math.min(totalPages, startPage + rangeSize - 1);

  //   if (endPage - startPage < rangeSize - 1) {
  //     startPage = Math.max(1, endPage - rangeSize + 1);
  //   }

  //   for (let i = startPage; i <= endPage; i++) {
  //     pageRange.push(i);
  //   }

  //   return pageRange;
  // };

  
  const generatePageRange = () => {
    const rangeSize = 5;
    const maxRange = Math.min(rangeSize, totalPages);
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(rangeSize / 2), totalPages - maxRange + 1));
    const endPage = Math.min(totalPages, startPage + rangeSize - 1);
  
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  const filteredorder = appliedProducts.filter((applied) => {
    return (
      applied.productName?.toLowerCase().includes(filterText?.toLowerCase()) ||
      applied.employeeID.toLowerCase().includes(filterText.toLowerCase()) ||
      applied.employeeName.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  return (
    <div className="container-fluid">
      <div className="card p-3 m-3">
        <div className="d-flex justify-content-end">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-success mb-4"
          >
            <i className="bi bi-plus-lg px-1"></i> Apply Product
          </button>
        </div>

        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editProduct ? "Edit Applied Product" : "Apply for a Product"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3"> 
                <Form.Label>Employee Name</Form.Label>
                <Form.Control type="text" value={employeeName} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Select Product</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedProduct}
                  onChange={(e) =>
                    handleFieldChange("selectedProduct", e.target.value)
                  }
                  disabled={!!editProduct}
                  onBlur={() => handleFieldBlur("selectedProduct")}
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </Form.Control>
                {errors.selectedProduct && (
                  <div className="text-danger">{errors.selectedProduct}</div>
                )}
              </Form.Group>
              <Form.Group  className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    handleFieldChange("quantity", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("quantity")}
                />
                {errors.quantity && (
                  <div className="text-danger">{errors.quantity}</div>
                )}
              </Form.Group>
              <Form.Group  className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  onBlur={() => handleFieldBlur("date")}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="success" onClick={handleSaveProduct}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">EmployeeID</th>
              <th className="text-center">Employee Name</th>
              <th className="text-center">Product Name</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Date</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredorder.map((appliedProduct, index) => (
              <tr key={index}>
                <td className="text-center">{appliedProduct.employeeID}</td>
                <td className="text-center">{appliedProduct.employeeName}</td>
                <td className="text-center">
                  {appliedProduct.productName || "N/A"}
                </td>
                <td className="text-center">{appliedProduct.quantity}</td>
                <td className="text-center">
                  {new Date(appliedProduct.date).toLocaleDateString()}
                </td>
                {/* <td>
          <Button variant="warning" onClick={() => handleEdit(appliedProduct)}   disabled={!isEditable(appliedProduct.date)} >Edit</Button>
          <Button variant="danger" onClick={() => handleDelete(appliedProduct._id)}  disabled={!isEditable(appliedProduct.date)} className="mx-2">Delete</Button>
        </td> */}
                <td className="text-center">
                  
                    <>
                      <Button
                        variant="warning"
                        onClick={() => handleEdit(appliedProduct)}
                        className="btn-sm"
                        disabled={checkDisableState(appliedProduct.appliedAt)}
                       
                      >
                        <i className="bi bi-pen text-white"></i>
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => handleDelete(appliedProduct._id)}
                        className="mx-2 btn-sm"
                        disabled={checkDisableState(appliedProduct.appliedAt)}
                      
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </>
                
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

export default AppliedProducts;
