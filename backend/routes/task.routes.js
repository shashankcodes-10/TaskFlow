const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

// @route POST /api/tasks
// @route GET  /api/tasks
router.route('/').post(protect, createTask).get(protect, getTasks);

// @route GET    /api/tasks/:id
// @route PUT    /api/tasks/:id
// @route DELETE /api/tasks/:id
router.route('/:id').get(protect, getTaskById).put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
