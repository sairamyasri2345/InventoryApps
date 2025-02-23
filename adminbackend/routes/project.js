const express = require("express");
const { addProject, getProjects,updateProject,deleteProject } = require("../controllers/project");

const router = express.Router();


router.post('/add-project', addProject);
router.get('/projects', getProjects);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
