// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  // Check if the user is authenticated (e.g., by checking for a token in localStorage)
  const isAuthenticated = !!localStorage.getItem("token");

  // If authenticated, render the element (protected component)
  // Otherwise, redirect to the login page
  return isAuthenticated ? element : <Navigate to="/" />;
};

export default ProtectedRoute;