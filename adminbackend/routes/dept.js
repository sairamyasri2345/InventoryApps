const express = require("express");
const {
  addDept,
  getDepts,
  updateDept,
  deleteDept,
} = require("../controllers/dept");

const router = express.Router();

router.post("/add-dept", addDept);
router.get("/depts", getDepts);
router.put("/:id", updateDept);
router.delete("/:id", deleteDept);

module.exports = router;
