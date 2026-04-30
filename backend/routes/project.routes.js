const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject
} = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// @route POST   /api/projects
// @route GET    /api/projects
router
  .route('/')
  .post(protect, authorize('Admin'), createProject)
  .get(protect, getProjects);

// @route GET    /api/projects/:id
// @route DELETE /api/projects/:id
router
  .route('/:id')
  .get(protect, getProjectById)
  .delete(protect, authorize('Admin'), deleteProject);

// @route POST   /api/projects/:id/add-member
router.post('/:id/add-member', protect, authorize('Admin'), addMember);

// @route DELETE /api/projects/:id/remove-member
router.delete('/:id/remove-member', protect, authorize('Admin'), removeMember);

module.exports = router;
