import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import Dashboard from "../../dashboard/dashboard";
import Order from "../order/order";
import EmpNavbar from "../navbar/navbar";
import Products from "../product/product";
import "./layout.css";
import ChangePassword from "../../changePassword/changepassword";
import ProtectedRoute from "../protectedRoute";
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

        const response = await fetch("http://localhost:3003/api/inventoryManager/me", {
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
                element={<ProtectedRoute
                element={
                  <Dashboard
                    products={products}
                    onDelete={handleDeleteProduct}
                    onEdit={handleEditProduct}
                  />
                } />}
              />
              <Route
                path="/orders"
                element={<ProtectedRoute
                element={<Order filterText={filterText} />}  />}
              />
              <Route
                path="/products"
                element={<ProtectedRoute 
                element={<Products filterText={filterText} />} />}
              />
              <Route path="/changepassword"   element={<ProtectedRoute element={<ChangePassword />} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
