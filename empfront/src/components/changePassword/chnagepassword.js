import React, { useState } from "react";
import axios from "axios";
import "./chnagepassword.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("New password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.");
      return;
    }

    try {
      const response = await axios.put(
        "https://inventoryappsatmos-1xdp.onrender.com/api/employees/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setMessage(response.data.message);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };


  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="d-flex justify-content-center align-items-center">
            <div className="change-password-container my-5 px-4 py-4">
              <h2>Change Password</h2>
              {message && <p className="text-success">{message}</p>}
              {error && <p className="text-danger">{error}</p>}
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label htmlFor="oldPassword">Old Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <small>
                    Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.
                  </small>
                </div>
                <button type="submit" className="btn btn-success mt-3">
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
