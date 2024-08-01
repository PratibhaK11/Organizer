const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const taskController = require('../controllers/taskController');

// Create task
router.post('/add', ensureAuthenticated, taskController.createTask);

// Update task (for updating categories, due date, priority, etc.)
router.patch('/:id', ensureAuthenticated, taskController.updateTask);

// Get tasks
router.get('/', ensureAuthenticated, taskController.getTasks);

// Delete task
router.delete('/:id', ensureAuthenticated, taskController.deleteTask);

module.exports = router;
