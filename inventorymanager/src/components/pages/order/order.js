
import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./order.css";
import axios from "axios";
import { Table,Tooltip,
  OverlayTrigger } from "react-bootstrap";

const AdminProducts = ({ filterText, darkMode }) => {
  const [appliedProducts, setAppliedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    const fetchAppliedProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://inventoryappsatmos-1xdp.onrender.com/api/appliedProducts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAppliedProducts(response.data);
      } catch (error) {
        console.error("Error fetching applied products:", error);
      }
    };
    fetchAppliedProducts();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `https://inventoryappsatmos-1xdp.onrender.com/api/appliedProducts/update-status/${id}`,
        { status: newStatus }
      );
      setAppliedProducts(
        appliedProducts.map((product) =>
          product._id === id ? { ...product, status: newStatus } : product
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Filter data based on filterText
  const filteredData = appliedProducts.filter(
    (item) =>
      (item.employeeId || "").includes(filterText) ||
      (item.employeeName || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      (item.date || "").includes(filterText) ||
      (item.status || "").toLowerCase().includes(filterText.toLowerCase()) ||
      (item.productName || "").toLowerCase().includes(filterText.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startRow, startRow + rowsPerPage);

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
      {appliedProducts.length === 0 ? (
        <p className="d-flex justify-content-center align-items-center text-success h2 py-5 my-5">
          Loading...
        </p>
      ) : (
        <div className="row p-5">
          <div className="col-md-12">
            <Table  bordered hover  responsive>
              <thead>
                <tr>
                  <th className="text-center">Employee Name</th>
                  <th className="text-center">Product Name</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-center">Date</th>
                  <th className="text-center">Approved Status</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((product) => (
                  <tr key={product._id}>
                    <td className="text-center">
                       <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${product._id}`}>
                                {product.employeeName} 
                              </Tooltip>
                            }
                          >
                            <span
                              className="d-inline-block text-truncate pwd-truncate"
                              style={{ maxWidth: "150px" }}
                            >
                             {product.employeeName} 
                            </span>
                          </OverlayTrigger></td>
                    <td className="text-center">{product.productName}</td>
                    <td className="text-center">{product.quantity}</td>
                    <td className="text-center">{new Date(product.date).toLocaleDateString()}</td>
                  <td className="text-center">
                      <select
                        value={product.status}
                        onChange={(e) =>
                          updateStatus(product._id, e.target.value)
                        }
                        disabled={product.status !== "Requested"}
                      >
                        <option value="Requested">Requested</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
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
      )}
    </div>
  );
};

export default AdminProducts;


