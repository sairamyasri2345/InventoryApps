

// import React, { useState, useEffect } from 'react';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import './orderList.css';
// import axios from 'axios';
// import { Button, Modal, Form, Table } from 'react-bootstrap';
// // Employee Order Page Component
// const EmployeeOrders = () => {
//     const [appliedProducts, setAppliedProducts] = useState([]);

//     useEffect(() => {
//       const fetchOrders = async () => {
//         try {
//           const employeeID = localStorage.getItem('employeeID');
//           const response = await axios.get(`http://localhost:3003/api/appliedProducts/${employeeID}`);
//           setAppliedProducts(response.data);
//         } catch (error) {
//           console.error("Error fetching orders:", error);
//         }
//       };

//       fetchOrders();
//     }, []);

//     return (
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>Product Name</th>
//             <th>Quantity</th>
//             <th>Date</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {appliedProducts.map((product) => (
//             <tr key={product._id}>
//               <td>{product.productName}</td>
//               <td>{product.quantity}</td>
//               <td>{new Date(product.date).toLocaleDateString()}</td>
//               <td>{product.status}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     );
//   };
import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './order.css';
import axios from 'axios';
import { Table } from 'react-bootstrap';


const EmployeeOrders = ({ filterText, onFilterChange }) => {
  const [appliedProducts, setAppliedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [pageSize, setPageSize] = useState(8);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const employeeID = localStorage.getItem('employeeID');
        const response = await axios.get(`http://localhost:3003/api/appliedProducts/${employeeID}`);
        setAppliedProducts(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Filter data based on filterText
  const filteredData = appliedProducts.filter((item) =>
    (item.employeeId || "").includes(filterText) ||
    (item.employeeName || "").toLowerCase().includes(filterText.toLowerCase()) ||
    (new Date(item.date).toLocaleDateString() || "").includes(filterText) ||
    (item.status || "").toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(appliedProducts.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = appliedProducts.slice(startRow, startRow + rowsPerPage);
  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const filteredorder= appliedProducts.filter((applied) => {
    return (
      applied.productName?.toLowerCase().includes(filterText?.toLowerCase()) ||
      applied.employeeID.toLowerCase().includes(filterText.toLowerCase()) ||
      applied.employeeName.toLowerCase().includes(filterText.toLowerCase()) 
      
    );
  })

  const updaterReceivedStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3003/api/appliedProducts/received-status/${id}`,
        { receivedStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Update the local state to reflect the change
      setAppliedProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product,receivedStatus: newStatus } : product
        )
      );
  
      console.log('receivedStatus updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };
  
  return (
    <div className="container-fluid">
    <div className='card  p-3 m-3'>
      <Table bordered hover  responsive>
        <thead>
          <tr>
            <th className='text-center'>Product Name</th>
            <th className='text-center'>Quantity</th>
            <th className='text-center'>Date</th>
            <th className='text-center'>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredorder.map((product) => (
            <tr key={product._id}>
              <td className='text-center'>{product.productName}</td>
              <td className='text-center'>{product.quantity}</td>
              <td className='text-center'>{new Date(product.date).toLocaleDateString()}</td>
              <td className="text-center">
  {product.deliveryStatus === "Delivered" ? (
    <select
      value={product.receivedStatus}
      onChange={(e) => updaterReceivedStatus(product._id, e.target.value)}
    >
   
      <option value="Received">Received</option>
      <option value="Not Received">Not Received</option>
    </select>
  ) : product.deliveryStatus === "Cancelled" ? (
    <span>Not Delivered</span>
  ) : <span>Not Delivered</span>}
</td>

            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination Controls */}
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

export default EmployeeOrders;
