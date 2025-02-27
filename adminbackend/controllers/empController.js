
const Employee = require('../models/employeeData');

// Add a new employee

exports.addEmployee = async (req, res) => {
  const { name, employeeID, email, password, designation, department } = req.body;

  if (!name || !employeeID || !email || !password || !designation || !department) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
  
    const existingEmployee = await Employee.findOne({ $or: [{ employeeID }, { email }] });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee ID or email already exists." });
    }

    const newEmployee = new Employee({ name, employeeID, email, password, designation, department});
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ message: "Error adding employee", error });
  }
};

// Get list of employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Error fetching employees", error });
    }
};
// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Error deleting employee", error });
  }
};


exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, employeeID, email, password, designation, department} = req.body;

  if (!name || !employeeID || !email || !password || !designation || !department) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { name, employeeID, email, password, designation, department },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Error updating employee", error });
  }
};
