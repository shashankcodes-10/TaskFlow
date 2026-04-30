const Project = require('../models/Project.model');
const Task = require('../models/Task.model');
const User = require('../models/User.model');

/**
 * @route   POST /api/projects
 * @desc    Create a new project (Admin only)
 * @access  Private/Admin
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      admin: req.user._id,
      members: [req.user._id] // Admin is auto-added as member
    });

    await project.populate('admin', 'name email role');

    res.status(201).json({ success: true, message: 'Project created.', project });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects the user belongs to
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'Admin') {
      // Admins see all projects they created OR are a member of
      projects = await Project.find({
        $or: [{ admin: req.user._id }, { members: req.user._id }]
      })
        .populate('admin', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      // Members only see projects they are in
      projects = await Project.find({ members: req.user._id })
        .populate('admin', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email role')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check access
    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    const isAdmin = project.admin._id.toString() === req.user._id.toString();

    if (!isMember && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/add-member
 * @desc    Add a member to the project (Admin only)
 * @access  Private/Admin
 */
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Only project admin can add members
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project admin can add members.' });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if already a member
    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is already a member.' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');

    res.status(200).json({ success: true, message: 'Member added successfully.', project });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id/remove-member
 * @desc    Remove a member from the project
 * @access  Private/Admin
 */
const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project admin can remove members.' });
    }

    // Cannot remove the admin
    if (project.admin.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project admin.' });
    }

    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();

    res.status(200).json({ success: true, message: 'Member removed successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project (Admin only)
 * @access  Private/Admin
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project admin can delete it.' });
    }

    // Also delete associated tasks
    await Task.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Project and associated tasks deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, getProjectById, addMember, removeMember, deleteProject };
