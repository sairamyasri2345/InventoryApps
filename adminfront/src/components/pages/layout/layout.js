// // src/components/pages/layout/Layout.js
// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Sidebar from "../sidebar/sidebar";
// import Navbar from "../navbar/navbar";
// import Products from "../product/product";
// import EmployeeList from "../empList/empList";

// const Layout = () => {
//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       <Sidebar />
//       <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Navbar />
//         <div style={{ padding: "20px", flex: 1 }}>
//           <Routes>
//             <Route path="/products" element={<Products />} />
//             <Route path="/employee-list" element={<EmployeeList />} />
//           </Routes>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import Dashboard from "../../dashboard/dashboard";
import Order from "../order/order";
import EmpNavbar from "../navbar/navbar";
import Products from "../product/product";
import EmployeeList from "../empList/empList";
import "./layout.css";
import ChangePassword from "../../changePassword/changepassword";
import ProtectedRoute from "../protectedRoute";
import Warehouse from "../warehouse/warehouse";
import ProjectManagement from "../projects/project";
const Layout = () => {
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [filterText, setFilterText] = useState("");
  const appContainerRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      appContainerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prevCollapsed) => !prevCollapsed);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = window.localStorage.getItem("token");

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await fetch("http://13.232.162.43/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data.data); // Set the user data from the response
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleAddProduct = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter((product) => product.id !== productId));
  };
  const handleFilterChange = (text) => {
    setFilterText(text);
  };

  const handleEditProduct = (updatedProduct) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  return (
    <div
      ref={appContainerRef}
      className={`container-fluid inventory-container ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      <div className="row ">
        <div
          className={`col-md-2 p-0 m-0 sidebar-col ${
            sidebarCollapsed ? "icons-only" : ""
          }`}
        >
          <Sidebar darkMode={darkMode} sidebarCollapsed={sidebarCollapsed} />
        </div>
        <div
          className={`col-md-10 p-0 m-0 ${sidebarCollapsed ? "expanded" : ""}`}
        >
          <EmpNavbar
            toggleFullScreen={toggleFullScreen}
            toggleDarkMode={toggleDarkMode}
            toggleSidebar={toggleSidebar}
            userData={userData}
            sidebarCollapsed={sidebarCollapsed}
            onFilterChange={handleFilterChange}
          />
          <div className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/layout/dashboard" />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    element={
                      <Dashboard
                        products={products}
                        onDelete={handleDeleteProduct}
                        onEdit={handleEditProduct}
                      />
                    }
                  />
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute element={<Order filterText={filterText} />} />
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute
                    element={<Products filterText={filterText} />}
                  />
                }
              />
              <Route
                path="/changepassword"
                element={<ProtectedRoute element={<ChangePassword />} />}
              />
              <Route
                path="/empList"
                element={
                  <ProtectedRoute
                    element={<EmployeeList filterText={filterText} />}
                  />
                }
              />
                <Route
                path="/projects"
                element={
                  <ProtectedRoute
                    element={<ProjectManagement filterText={filterText} />}
                  />
                }
              />
                 <Route
                path="/warehouse"
                element={
                  <ProtectedRoute
                    element={<Warehouse filterText={filterText} />}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
