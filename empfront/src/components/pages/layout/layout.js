import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import Navbar from "../navbar/navbar";
import Products from "../../appliedproduct/appliedPro";


const Layout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ padding: "20px", flex: 1 }}>
          <Routes>
            <Route path="/applied-products" element={<Products />} />

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Layout;
