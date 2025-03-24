import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";
import axios from "axios";

const ProjectManagement = ({ darkMode, filterText }) => {
  const [show, setShow] = useState(false);
  const [deptShow, setDeptShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deptCurrentPage, setDeptCurrentPage] = useState(1);
  const rowsPerPage = 3;
  const rowsPerPageDept = 3;
  const [deptEditMode, setDeptEditMode] = useState(false);
  const [deptData, setDeptData] = useState({
    name: "", date:""})
  const [editMode, setEditMode] = useState(false);
  const [projectData, setProjectData] = useState({
    name: "",
    date: "",
  });
  const [projects, setProjects] = useState([]);
  const [depts, setDepts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentDeptId, setCurrentDeptId] = useState(null);
  const handleShow = () => setShow(true);
  const handleDeptShow = () => setDeptShow(true);
  const handleCloseDept = () => {
    setDeptShow(false);
    setDeptEditMode(false);
    setDeptData({
      name: "",
      date: "",
    });
  }
  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setProjectData({
      name: "",
      date: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData({ ...projectData, [name]: value });
  };
const deptChange = (e) => {
  const { name, value } = e.target;
  setDeptData({ ...deptData, [name]: value });
}

const fetchDepts=async()=>{
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://13.233.115.70:3003/api/depts/depts",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setDepts(response.data);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}
  // Fetch products from the database
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://13.233.115.70:3003/api/projects/projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

 

  useEffect(() => {
    fetchProducts();
    fetchDepts();
  }, []);

  const handleSave = async () => {
    const errors = {};
    if (!projectData.name) errors.name = "Project name is required.";
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (editMode) {
        await axios.put(
          `http://13.233.115.70:3003/api/projects/${currentProjectId}`,
          projectData
        );
      } else {
        await axios.post(
          "http://13.233.115.70:3003/api/projects/add-project",
          projectData
        );
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };
  const handledeptSave = async () => {
    const errors = {};
    if (!deptData.name) errors.name = "Department name is required.";
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (editMode) {
        await axios.put(
          `http://13.233.115.70:3003/api/depts/${currentProjectId}`,
          deptData
        );
      } else {
        await axios.post(
          "http://13.233.115.70:3003/api/depts/add-dept",
          deptData
        );
      }
      fetchDepts();
      handleCloseDept();
    } catch (error) {
      console.error("Error saving Department:", error);
    }
  };
  const handledeptEdit = (dept) => {
    setDeptEditMode(true);
    setCurrentDeptId(dept._id);
    setDeptData({
      name: dept.name,
      date: dept.date
        ? new Date(dept.date).toISOString().split("T")[0]
        : "",
    });
    handleDeptShow();
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setCurrentProjectId(product._id);
    setProjectData({
      name: product.name,
      date: product.date
        ? new Date(product.date).toISOString().split("T")[0]
        : "",
    });
    handleShow();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://13.233.115.70:3003/api/projects/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  const handleDeptDelete = async (id) => {
    try {
      await axios.delete(`http://13.233.115.70:3003/api/depts/${id}`);
      fetchDepts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  const filteredProducts = projects.filter((project) =>
    project.name?.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredDepts = depts.filter((dept) =>
    dept.name?.toLowerCase().includes(filterText.toLowerCase())   
);
  // Pagination logic
  const totalPages = Math.ceil(projects.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = projects.slice(startRow, startRow + rowsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page range to show around current page
  const generatePageRange = () => {
    const pageRange = [];
    const rangeSize = 3; // Number of pages to show before and after current page
    const maxRange = Math.min(rangeSize, totalPages); // Max number of pages to display

    let startPage = Math.max(1, currentPage - Math.floor(rangeSize / 2));
    let endPage = Math.min(totalPages, startPage + rangeSize - 1);

    // Adjust startPage if there are fewer pages than the range size
    if (endPage - startPage < rangeSize - 1) {
      startPage = Math.max(1, endPage - rangeSize + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageRange.push(i);
    }

    return pageRange;
  };

  // const handleProjectClick = (projectName) => {
  //   // Regex to check if the input is a URL
  //   const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(:\d+)?(\/.*)?$/;
  
  //   if (urlPattern.test(projectName)) {
  //     // Ensure the URL has "http://" or "https://"
  //     const formattedURL = projectName.startsWith("http") ? projectName : `https://${projectName}`;
  //     window.open(formattedURL, "_blank"); // Open in a new tab
  //   } else {
  //     // Handle normal project name (e.g., show details)
  //     console.log("Opening project:", projectName);
  //     alert(`Opening project: ${projectName}`);
  //   }
  // };
  const handleProjectClick = (projectName) => {
    const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(:\d+)?(\/.*)?$/;
  
    if (urlPattern.test(projectName)) {
      const formattedURL = projectName.startsWith("http") ? projectName : `https://${projectName}`;
      window.open(formattedURL, "_blank");
    } else {
      alert(`Opening project: ${projectName}`);
    }
  };
  
  // Pagination logic
  const totalDeptPages = Math.ceil(depts.length / rowsPerPageDept); 
  const startdeptRow = (currentPage - 1) * rowsPerPageDept;
  const currentDeptData = projects.slice(startdeptRow, startdeptRow + rowsPerPageDept);

  // Handle page change
  const handleDeptPageChange = (pageNumber) => {
    setDeptCurrentPage(pageNumber);
  };

  // Generate page range to show around current page
  const generateDeptPageRange = () => {
    const pageRange = [];
    const rangeSize = 3; // Number of pages to show before and after current page
    const maxRange = Math.min(rangeSize, totalDeptPages); // Max number of pages to display

    let startPage = Math.max(1, currentPage - Math.floor(rangeSize / 2));
    let endPage = Math.min(totalDeptPages, startPage + rangeSize - 1);

    // Adjust startPage if there are fewer pages than the range size
    if (endPage - startPage < rangeSize - 1) {
      startPage = Math.max(1, endPage - rangeSize + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageRange.push(i);
    }

    return pageRange;
  };
  return (
    <div className={`container-fluid ${darkMode ? "dark-mode" : ""}`}>
      <div className="card p-3 m-3 mb-4">
        <div className="d-flex justify-content-end">
          <button
            onClick={() => {
              setEditMode(false);
              handleShow();
            }}
            className="btn btn-success mb-4"
          >
            <i className="bi bi-plus-lg px-1"></i> Add Projects
          </button>
        </div>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editMode ? "Edit Project" : "Add Project"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={projectData.name}
                  onChange={handleChange}
                  placeholder="Enter Project Name"
                />
                {validationErrors.name && (
                  <Form.Text className="text-danger">
                    {validationErrors.name}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={projectData.date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="success" onClick={handleSave}>
              {editMode ? "Update Project" : "Add Project"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">Project Name</th>
              <th className="text-center">Date</th>

              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => {
             
              return (
                <tr key={product._id}>
                <td 
  className="text-center cursor-pointer text-blue-600 underline" 
  onClick={() => handleProjectClick(product.name)}
>
  {product.name}
</td>

                  <td className="text-center">
                    {new Date().toLocaleDateString()}
                  </td>

                  <td className="text-center">
                    <Button
                      variant="warning"
                      onClick={() => handleEdit(product)}
                      className="btn-sm "
                    >
                      <i className="bi bi-pen text-white"></i>
                    </Button>{" "}
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(product._id)}
                      className="btn-sm"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="pagination d-flex justify-content-center mt-3">
          <button
            className="page-item"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button
            className="page-item"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ❮
          </button>
          {generatePageRange().map((page) => (
            <button
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="page-item"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ❯
          </button>
          <button
            className="page-item"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
      <div className="card p-3 m-3">
        <div className="d-flex justify-content-end">
          <button className="btn btn-success mb-4" onClick={handleDeptShow}>
            <i className="bi bi-plus-lg px-1"></i> Add Departments
          </button>
        </div>

        <Modal show={deptShow} onHide={handleCloseDept}>
          <Modal.Header closeButton>
            <Modal.Title>
              {deptEditMode ? "Edit Department" : "Add Department"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Department Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={deptData.name}
                  onChange={deptChange}
                  placeholder="Enter Department Name"
                />
                {validationErrors.name && (
                  <Form.Text className="text-danger">
                    {validationErrors.name}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={deptData.date}
                  onChange={deptChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDept}>
              Close
            </Button>
            <Button variant="success" onClick={handledeptSave}>
              {editMode ? "Update Department" : "Add Department"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">Department Name</th>
              <th className="text-center">Date</th>

              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepts.map((dept, index) => {
       
              return (
                <tr key={dept._id}>
                  <td className="text-center">{dept.name}</td>
                  <td className="text-center">
                    {new Date().toLocaleDateString()}
                  </td>

                  <td className="text-center">
                    <Button
                      variant="warning"
                      onClick={() => handledeptEdit(dept)}
                      className="btn-sm "
                    >
                      <i className="bi bi-pen text-white"></i>
                    </Button>{" "}
                    <Button
                      variant="danger"
                      onClick={() => handleDeptDelete(dept._id)}
                      className="btn-sm"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="pagination d-flex justify-content-center mt-3">
          <button
            className="page-item"
            onClick={() => handleDeptPageChange(1)}
            disabled={deptCurrentPage === 1}
          >
            «
          </button>
          <button
            className="page-item"
            onClick={() => handleDeptPageChange(deptCurrentPage - 1)}
            disabled={deptCurrentPage === 1}
          >
            ❮
          </button>
          {generatePageRange().map((page) => (
            <button
              key={page}
              className={`page-item ${deptCurrentPage === page ? "active" : ""}`}
              onClick={() => handleDeptPageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="page-item"
            onClick={() => handlePageChange(deptCurrentPage + 1)}
            disabled={deptCurrentPage === totalPages}
          >
            ❯
          </button>
          <button
            className="page-item"
            onClick={() => handlePageChange(totalPages)}
            disabled={deptCurrentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
