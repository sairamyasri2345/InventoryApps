import React from "react";
import Login from "./components/login/login";
import Layout from "./components/pages/layout/layout";
import 'bootstrap/dist/css/bootstrap.min.css';
import EmpSignUp from "./components/register/register";
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("token");

  return token ? element : <Navigate to="/" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<EmpSignUp/>}/>
        {/* <Route path="/layout/*" element={<Layout />} /> */}
        <Route path="/layout/*" element={<ProtectedRoute element={<Layout />} />} />
      </Routes>
    </Router>
  );
};

export default App;
