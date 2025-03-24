import React, { useState } from 'react';
import "./login.css";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

const EmpLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isChecked, setIsChecked] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkError, setCheckError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const validateForm = () => {
    let valid = true;

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 5) {
      setPasswordError("Password must be at least 5 characters long");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!isChecked) {
      setCheckError("Please check this box if you want to proceed");
      valid = false;
    } else {
      setCheckError("");
    }

    return valid;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(""); // Clear email error
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(""); // Clear password error
  };

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    if (checkError) setCheckError(""); // Clear checkbox error
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const response = await axios.post('http://13.233.115.70:3003/api/employees/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('employeeID', response.data.employee.employeeID);
        localStorage.setItem('employeeEmail', response.data.employee.email);
        localStorage.setItem('employeeName', response.data.employee.name);
        console.log(response.data)
        navigate('/layout/dashboard');
      }
    } catch (error) {
      if (error.response) {
    
        if (error.response.status === 404) {
          alert("User not registered.");
        } else if (error.response.status === 401) {
          alert("Incorrect password.");
        } else {
          alert("An error occurred. Please try again later.");
        }
      } else {

        alert("Unable to connect to the server.");
      }
    }
  };


  return (
    <div className="container-fluid login-cont d-flex align-items-center justify-content-center signup-cont vh-100">
      <div className="row justify-content-center w-100">
        <div className="col-lg-11 d-flex justify-content-center align-items-center">
          <div className="form-container d-flex flex-column flex-md-row bg-white shadow-sm rounded-5 w-100">
            <div className="sub-container col-md-6 d-none d-md-flex align-items-center justify-content-center p-5">
              <div className="bg-container text-white p-4">
                <div className="border-icon-container mb-4">
                  <i className="bi bi-arrow-right"></i>
                </div>
                <p className="mt-5 sub-title">Hi, Welcome!!</p>
                <h1 className="title">Let's Get Started</h1>
                <p className="py-3 sub-title">
                  Sign in to your account to access the platform.
                  <span className="d-block sub-title">
                    We invite you to join us and get a better experience.
                  </span>
                </p>
                <img
                  src={require("../assets/bg-img-removebg-preview.png")}
                  alt="woman with laptop"
                  className="img-logo d-block"
                />
              </div>
            </div>
            <form className="col-md-6 p-5 d-flex flex-column" onSubmit={handleLogin}>
              <h1 className="login-heading">Login</h1>
              <div className="form-group my-2">
                <label htmlFor="email" className="py-2 d-flex justify-content-start">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  onChange={handleEmailChange}
                  placeholder="Enter Your Email"
                  value={email}
                />
                {emailError && <div className="text-danger d-flex justify-content-end">{emailError}</div>}
              </div>
              <div className="form-group my-2 position-relative">
                <label htmlFor="exampleInputPassword1" className="py-2  d-flex justify-content-start">Password</label>
                <input
                   type={passwordVisible ? "text" : "password"}
                  className="form-control"
                  id="exampleInputPassword1"
                  onChange={handlePasswordChange}
                  placeholder="Password"
                  value={password}
                />
                 <i
                  className={`bi ${passwordVisible ? "bi-eye-fill" : "bi-eye-slash-fill"} emp-login curser-pointer`}
                  
                  onClick={togglePasswordVisibility}
                ></i>
                {passwordError && <div className="text-danger d-flex justify-content-end">{passwordError}</div>}
              </div>
              <div className="form-check my-2">
                <input
                  type="checkbox"
                  className="form-check-input mt-2"
                  id="check"
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label  d-flex justify-content-start" htmlFor="check">Remember me</label>
                {checkError && <div className="text-danger  d-flex justify-content-start">{checkError}</div>}
              </div>
              <button type="submit" className="btn btn-success w-100 btn-lg my-3 rounded-5">
                LOGIN
              </button>
              {/* <div className="text-center">
                <h5>(or)</h5>
                <h5 className="my-3">
                  Don't have an account?
                  <Link className="nav-link text-white fs-5 d-inline text-decoration-none" to="/empSignup">
                    <span className="text-success px-1">Register</span>
                  </Link>
                  Here
                </h5>
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpLogin;













