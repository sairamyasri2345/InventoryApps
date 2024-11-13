
const express = require('express');
const { addEmployee, getEmployees,deleteEmployee} = require('../controllers/empController');

const router = express.Router();


router.post('/add-employee', addEmployee);


router.get('/', getEmployees);
router.delete('/:id', deleteEmployee);


module.exports = router;
