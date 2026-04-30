const Task = require('../models/Task.model');
const Project = require('../models/Project.model');
const User = require('../models/User.model');

/**
 * @route   GET /api/dashboard
 * @desc    Get comprehensive dashboard statistics
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Get user's projects
    const userProjects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }]
    }).select('_id name color');

    const projectIds = userProjects.map((p) => p._id);

    // Build base query for tasks
    const taskMatchQuery = { projectId: { $in: projectIds } };
    if (req.user.role === 'Member') {
      taskMatchQuery.assignedTo = req.user._id;
    }

    // Total tasks in user's projects
    const totalTasks = await Task.countDocuments(taskMatchQuery);

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: taskMatchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: taskMatchQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Overdue tasks (dueDate < now AND status != Done)
    const overdueTasks = await Task.find({
      ...taskMatchQuery,
      dueDate: { $lt: now },
      status: { $ne: 'Done' }
    })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name color')
      .sort({ dueDate: 1 })
      .limit(10);

    // Tasks per user (for admins, show across all project members)
    const tasksPerUser = await Task.aggregate([
      { $match: taskMatchQuery },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'To Do'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          total: 1,
          todo: 1,
          inProgress: 1,
          done: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    // My tasks (assigned to me)
    const myTasks = await Task.find({
      assignedTo: req.user._id,
      projectId: { $in: projectIds }
    })
      .populate('projectId', 'name color')
      .sort({ dueDate: 1 })
      .limit(5);

    // Recent activity (tasks created/updated recently)
    const recentTasks = await Task.find(taskMatchQuery)
      .populate('assignedTo', 'name')
      .populate('projectId', 'name color')
      .sort({ updatedAt: -1 })
      .limit(8);

    // Format status counts as object
    const statusMap = { 'To Do': 0, 'In Progress': 0, Done: 0 };
    tasksByStatus.forEach((s) => { statusMap[s._id] = s.count; });

    const priorityMap = { Low: 0, Medium: 0, High: 0 };
    tasksByPriority.forEach((p) => { priorityMap[p._id] = p.count; });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        totalProjects: userProjects.length,
        overdueCount: overdueTasks.length,
        tasksByStatus: statusMap,
        tasksByPriority: priorityMap,
        tasksPerUser,
        overdueTasks,
        myTasks,
        recentTasks,
        projects: userProjects
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
