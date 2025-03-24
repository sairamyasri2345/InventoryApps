import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Table,
  Form,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import "./empList.css";
import axios from "axios";

const EmployeeManagement = ({ darkMode, filterText }) => {
  const [show, setShow] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [passwordCardVisible, setPasswordCardVisible] = useState(false);
  const [deptsData, setDeptsData] = useState([]);
  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [employeeData, setEmployeeData] = useState({
    name: "",
    employeeID: "",
    email: "",
    password: "",
    // phonenumber: "",
    department: "",
    designation: "",
  });
  const [totalRecords, setTotalRecords] = useState(0);

  const [employees, setEmployees] = useState([]);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    employeeID: false,
    email: false,
    password: false,
    // phonenumber: false,
    department: false,
    designation: false,
  });
  const handleDeptSelection = (e) => {
    const selectedDept = deptsData.find(dept => dept.name === e.target.value);
    if (selectedDept) {
      setEmployeeData(prevData => ({
        ...prevData,
        department: selectedDept.name,
      }));
    }
  };
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    employeeID: "",
    email: "",
    password: "",
    // phonenumber: "",
    department: "",
    designation: "",
  });

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData({ ...employeeData, [name]: value });

    // Clear error message if the input is valid
    if (value) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    return (
      employee.name.toLowerCase().includes(filterText.toLowerCase()) ||
      employee.employeeID.toLowerCase().includes(filterText.toLowerCase()) ||
      employee.email.toLowerCase().includes(filterText.toLowerCase()) ||
      employee.designation.toLowerCase().includes(filterText.toLowerCase()) ||
      employee.department.toLowerCase().includes(filterText.toLowerCase())
    );
  });
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });
  };

  const fetchDepartment = async () => {
    try {
      const deptRes = await axios.get("http://13.233.115.70:3003/api/depts/depts");
      console.log("Dept:", deptRes.data);
      setDeptsData(deptRes.data);
    } catch (error) {
      console.error("Error fetching dept:", error);
    }
  };
  const handlePasswordChange = (e) => {
    const { value } = e.target;

    setEmployeeData({ ...employeeData, password: value });

    // Validate password conditions
    const conditions = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };

    setPasswordConditions(conditions);

    // Show card if not all conditions are met
    setPasswordCardVisible(
      !Object.values(conditions).every((condition) => condition)
    );
  };

  // Validation function
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!employeeData.name) {
      errors.name = "Employee Name is required";
      isValid = false;
    }
    if (!employeeData.employeeID) {
      errors.employeeID = "Employee ID is required";
      isValid = false;
    }
    if (!employeeData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(employeeData.email)) {
      errors.email = "Email address is invalid";
      isValid = false;
    }
    if (!employeeData.password) {
      errors.password = "Password is required";
      isValid = false;
    }
   
    if (!employeeData.designation) {
      errors.designation = "Designation is required";
      isValid = false;
    }
    if (!employeeData.department) {
      errors.designation = "Department is required";
      isValid = false;
    }
    setValidationErrors(errors);
    return isValid;
  };

  // Fetch employees from backend
  const fetchEmployees = async (page = 1, limit = pageSize) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://13.233.115.70:3003/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartment();
  }, []);

 
  const handleSave = async () => {

    const isValid = validateForm();
    if (isValid) {
      try {
        if (editMode) {
       
          const response = await axios.put(
            `http://13.233.115.70:3003/api/employees/${currentEmployee._id}`,
            employeeData
          );
          if (response.status === 200) {
            const updatedEmployees = employees.map((emp) =>
              emp._id === response.data._id ? response.data : emp
            );
            setEmployees(updatedEmployees);
          }
        } else {
         
          const response = await axios.post(
            "http://13.233.115.70:3003/api/employees/add-employee",
            employeeData
          );
          if (response.status === 201) {
            setEmployees([...employees, response.data]);
          }
        }
        

        handleClose();
        

        setEmployeeData({
          name: "",
          employeeID: "",
          email: "",
          password: "",
          // phonenumber: "",
          department: "",
          designation: "",
        });
      } catch (error) {
        console.error("Error saving employee:", error);
        alert(error.response?.data?.message || "Error saving employee");
      }
    } else {
      setTouchedFields({
        name: true,
        employeeID: true,
        email: true,
        password: true,
        // phonenumber: true,
        department: true,
        designation: true,
      });
    }
  };

  const handleDelete = async (id) => {
    console.log("Deleting employee with ID:", id);
    try {
      await axios.delete(`http://13.233.115.70:3003/api/employees/${id}`);
      fetchEmployees(); // Refresh employee list after deletion
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };
  // Pagination logic
  const totalPages = Math.ceil(employees.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentData = employees.slice(startRow, startRow + rowsPerPage);

  // Handle page change
  //  const handlePageChange = (pageNumber) => {
  //    setCurrentPage(pageNumber);

  //  };
  const handlePageChange = (event) => {
    setCurrentPage(event.page.skip / pageSize + 1);
    setPageSize(event.page.take);
  };
  const handleEdit = (employee) => {
    setEditMode(true);
    setCurrentEmployee(employee);
    setEmployeeData(employee); // Populate the form with existing data
    handleShow();
  };

  // Generate page range to show around current page
  const generatePageRange = () => {
    const pageRange = [];
    const rangeSize = 5; // Number of pages to show before and after current page
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

  return (
    <div className={`container-fluid  ${darkMode ? "dark-mode" : ""}`}>
      <div className="row">
        <div className="col-md-12">
          <div className="card m-3">
            <div className="card-body">
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-success" onClick={handleShow}>
                  <i className="bi bi-plus-lg px-1"></i>Add Employee
                </button>
              </div>

              {/* Modal for adding a new employee */}
              <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Add Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-2">
                      <Form.Label>Employee Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={employeeData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter employee name"
                      />
                      {(touchedFields.name || !employeeData.name) &&
                        validationErrors.name && (
                          <Form.Text className="text-danger">
                            {validationErrors.name}
                          </Form.Text>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Employee ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="employeeID"
                        value={employeeData.employeeID}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter employee ID"
                      />
                      {(touchedFields.employeeID || !employeeData.employeeID) &&
                        validationErrors.employeeID && (
                          <Form.Text className="text-danger">
                            {validationErrors.employeeID}
                          </Form.Text>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={employeeData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter email"
                      />
                      {(touchedFields.email || !employeeData.email) &&
                        validationErrors.email && (
                          <Form.Text className="text-danger">
                            {validationErrors.email}
                          </Form.Text>
                        )}
                    </Form.Group>
                    {/* <Form.Group className="position-relative mb-2">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type={passwordVisible ? "text" : "password"}
                          name="password"
                          value={employeeData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter password"
                        />
                        <i
                          className={`bi ${
                            passwordVisible ? "bi-eye-fill" : "bi-eye-slash-fill"
                          } curser-pointer employee-list`}
                          onClick={togglePasswordVisibility}
                        ></i>
                        {(touchedFields.password || !employeeData.password) &&
                          validationErrors.password && (
                            <Form.Text className="text-danger">
                              {validationErrors.password}
                            </Form.Text>
                          )}
                        <small className="form-text text-muted  ">
                          Password must be at least 8 characters long, contain one
                          uppercase letter, one lowercase letter, one number, and
                          one special character.
                        </small>
                      </Form.Group> */}
                    <Form.Group className="position-relative mb-2">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        value={employeeData.password}
                        onChange={handlePasswordChange}
                        onBlur={handleBlur}
                        placeholder="Enter password"
                      />
                      <i
                        className={`bi ${
                          passwordVisible ? "bi-eye-fill" : "bi-eye-slash-fill"
                        } cursor-pointer employee-list`}
                        onClick={togglePasswordVisibility}
                      ></i>
                      {(touchedFields.password || !employeeData.password) &&
                        validationErrors.password && (
                          <Form.Text className="text-danger">
                            {validationErrors.password}
                          </Form.Text>
                        )}

                      {/* Validation Card */}
                      {passwordCardVisible && (
                        <div className="card mt-2 p-3">
                          <h6>Password Requirements</h6>
                          <ul>
                            <li
                              className={
                                passwordConditions.length
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              At least 8 characters
                            </li>
                            <li
                              className={
                                passwordConditions.uppercase
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              At least one uppercase letter
                            </li>
                            <li
                              className={
                                passwordConditions.lowercase
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              At least one lowercase letter
                            </li>
                            <li
                              className={
                                passwordConditions.number
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              At least one number
                            </li>
                            <li
                              className={
                                passwordConditions.special
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              At least one special character
                            </li>
                          </ul>
                        </div>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Designation</Form.Label>
                      <Form.Control
                        type="text"
                        name="designation"
                        value={employeeData.designation}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter designation"
                      />
                      {(touchedFields.designation ||
                        !employeeData.designation) &&
                        validationErrors.designation && (
                          <Form.Text className="text-danger">
                            {validationErrors.designation}
                          </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label>Select Department</Form.Label>
                      <Form.Select
                        name="name"
                        onChange={handleDeptSelection}
                        onBlur={handleBlur}
                      >
                        <option value="">Select Department</option>
                        {deptsData.map((dept) => (
                          <option key={dept._id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                   
                      {(touchedFields.name || !deptsData.name) &&
                        validationErrors.name && (
                          <Form.Text className="text-danger">
                            {validationErrors.name}
                          </Form.Text>
                        )}
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="success" onClick={handleSave}>
                    Save
                  </Button>
                </Modal.Footer>
              </Modal>
              <div className="table-responsive">
                <Table responsive hover bordered>
                  <thead>
                    <tr>
                      <th className="text-center">Employee Name</th>
                      <th className="text-center">Employee ID</th>
                      <th className="text-center">Email</th>
                      <th className="text-center">Password</th>
                      {/* <th className="text-center">Phone Number</th> */}
                      <th className="text-center">Department</th>
                      <th className="text-center">Designation</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee._id}>
                        <td className="text-center">
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${employee._id}`}>
                                {employee.name}
                              </Tooltip>
                            }
                          >
                            <span
                              className="d-inline-block text-truncate pwd-truncate"
                              style={{ maxWidth: "150px" }}
                            >
                              {employee.name}
                            </span>
                          </OverlayTrigger>
                        </td>
                        <td className="text-center">{employee.employeeID}</td>
                        <td className="text-center">{employee.email}</td>
                        <td className="text-center">
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${employee._id}`}>
                                {employee.password}
                              </Tooltip>
                            }
                          >
                            <span
                              className="d-inline-block text-truncate pwd-truncate"
                              style={{ maxWidth: "150px" }}
                            >
                              {employee.password}
                            </span>
                          </OverlayTrigger>
                        </td>
                        {/* <td className="text-center">{employee.phonenumber}</td> */}
                        <td className="text-center">{employee.department}</td>
                        <td className="text-center">
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${employee._id}`}>
                                {employee.designation}
                              </Tooltip>
                            }
                          >
                            <span
                              className="d-inline-block text-truncate pwd-truncate"
                              style={{ maxWidth: "150px" }}
                            >
                              {employee.designation}
                            </span>
                          </OverlayTrigger>
                        </td>

                        <td className="text-center">
                          <button
                            className="btn btn-warning btn-sm mx-2"
                            onClick={() => handleEdit(employee)}
                          >
                            <i className="bi bi-pen"></i>
                          </button>

                          <button
                            onClick={() => handleDelete(employee._id)}
                            className="btn btn-danger btn-sm"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
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
                    className={`page-item ${
                      currentPage === page ? "active" : ""
                    }`}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
