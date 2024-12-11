import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login/login";
import Layout from "./components/pages/layout/layout";
import 'bootstrap/dist/css/bootstrap.min.css';
import EmpSignUp from "./components/register/register";
import 'bootstrap-icons/font/bootstrap-icons.css'; 


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<EmpSignUp/>}/>
        <Route path="/layout/*" element={<Layout />} />
      </Routes>
    </Router>
  );
};

export default App;
