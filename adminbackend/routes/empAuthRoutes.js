// admin/backend/routes/employeeAuthRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employeeData");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the password is stored in plain text or hashed
    const isMatch = employee.password === password || await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token if authentication is successful
    const token = jwt.sign(
      { id: employee._id, email: employee.email },
      "@453$^4532#@$!%^!T~Yvfwgd@$^%TyvgdY48IHYEQYTREDJYKFVDK",
      { expiresIn: "1h" }
    );

    res.json({ token, employee, message: "Login successful" });

  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// router.post("/change-password", async (req, res) => {
//   const { employeeID, oldPassword, newPassword } = req.body;

//   try {
//     const employee = await Employee.findById(employeeID);
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     // Check if old password matches
//     const isMatch = bcrypt.compareSync(oldPassword, employee.password);
//     if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

//     // Hash the new password and update
//     const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
//     employee.password = hashedNewPassword;
//     await employee.save();

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     res.status(500).json({ message: "Error changing password", error });
//   }
// });


const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization denied, no token" });
  }

  try {
    const decoded = jwt.verify(token, "@453$^4532#@$!%^!T~Yvfwgd@$^%TyvgdY48IHYEQYTREDJYKFVDK");
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};



router.put("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const employee = await Employee.findById(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Verify old password
    const isMatch = user.password === oldPassword || await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.",
      });
    }

    // Hash and update new password
    employee.password = await bcrypt.hash(newPassword, 10);
    await employee.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password" });
  }
});


module.exports = router;
// router.put("/change-password", authMiddleware, async (req, res) => {
//   const { oldPassword, newPassword } = req.body;

//   try {
//     const employee = await Employee.findById(req.user.id); // Assuming authMiddleware attaches user ID to req.user
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // Check if the old password is correct
//     const isMatch = await bcrypt.compare(oldPassword, employee.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Old password is incorrect" });
//     }

//     // Hash the new password and save it
//     employee.password = await bcrypt.hash(newPassword, 10);
//     await employee.save();

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error changing password", error });
//   }
// });

module.exports = router;
