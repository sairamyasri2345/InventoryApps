// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login/login";
import Layout from "./components/layout/layout";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NotFound from "./components/pages/notfound/notfound";
import ProtectedRoute from "./components/pages/protectedRoute";


const App = () => {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<NotFound/>}/>
        <Route path="/layout/*" element={<ProtectedRoute element={<Layout />} />} />
      </Routes>
    </Router>
  );
};

export default App;