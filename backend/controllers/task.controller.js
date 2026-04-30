const Task = require('../models/Task.model');
const Project = require('../models/Project.model');

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, projectId } = req.body;

    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    const isAdmin = project.admin.toString() === req.user._id.toString();

    if (!isMember && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    if (req.user.role === 'Member') {
      return res.status(403).json({ success: false, message: 'Members cannot create tasks.' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      projectId,
      createdBy: req.user._id
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'projectId', select: 'name color' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({ success: true, message: 'Task created successfully.', task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks
 * @desc    Get tasks — filtered by project, status, priority, assignedTo
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedTo } = req.query;

    // Build query
    let query = {};

    if (projectId) {
      query.projectId = projectId;
    } else {
      // Only return tasks from projects the user is a member of
      const userProjects = await Project.find({
        $or: [{ admin: req.user._id }, { members: req.user._id }]
      }).select('_id');
      query.projectId = { $in: userProjects.map((p) => p._id) };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Members can only view tasks assigned to them
    if (req.user.role === 'Member') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name color')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name color')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (req.user.role === 'Member') {
      const assignedId = task.assignedTo && task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo?.toString();
      if (assignedId !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view tasks assigned to you.' });
      }
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Check if user has access (member of the project)
    const project = await Project.findById(task.projectId);
    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    const isAdmin = project.admin.toString() === req.user._id.toString();

    if (!isMember && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (req.user.role === 'Member') {
      const assignedId = task.assignedTo && task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo?.toString();
      if (assignedId !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only update tasks assigned to you.' });
      }
      
      // Prevent Members from reassigning the task to someone else
      if (req.body.assignedTo && req.body.assignedTo !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Members cannot reassign tasks.' });
      }
    }

    const allowedFields = ['title', 'description', 'dueDate', 'priority', 'status', 'assignedTo'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'projectId', select: 'name color' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(200).json({ success: true, message: 'Task updated successfully.', task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const project = await Project.findById(task.projectId);
    const isAdmin = project.admin.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (req.user.role === 'Member') {
      return res.status(403).json({ success: false, message: 'Members cannot delete tasks.' });
    }

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'Only the task creator or project admin can delete this task.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
