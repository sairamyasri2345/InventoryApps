import React from "react";
import "./notfound.css";

const NotFound = () => {
  return (
    <div className="container-fluid m-0 p-0 img-cont">
      <div className="row vh-100 vw-100 m-0 p-0">
        <div className="col-12 col-md-12 p-0">
          <div className="d-flex justify-content-center align-items-center">
            <img
              src={require("../../assets/gst_bg_054_19.jpg")}
              alt="notfound-img"
              className="notfound-img img-fluid"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;