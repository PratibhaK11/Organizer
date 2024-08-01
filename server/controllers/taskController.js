const Task = require('../models/Task');
const User = require('../models/User');
const webpush = require('../config/webPush');

// Create Task
// Create Task
exports.createTask = async (req, res) => {
  const { title, description, categories, dueDate, priority, status, alarm } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    // Parse dueDate as a Date object if provided
    const parsedDueDate = dueDate ? new Date(dueDate) : null;

    // Check if dueDate is valid
    if (dueDate && isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ error: 'Invalid dueDate format' });
    }

    // Create and save the new task
    const newTask = new Task({
      title,
      description,
      user: req.user.id,
      categories,
      dueDate: parsedDueDate,
      priority,
      status,
      alarm  // Include alarm field
    });

    await newTask.save();

    // Fetch the user's subscription details
    const user = await User.findById(req.user.id);

    if (user && user.subscription) {
      const { endpoint, keys } = user.subscription;

      // Check for missing or invalid subscription data
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        console.warn('Invalid subscription object:', user.subscription);
        return res.status(400).json({ error: 'Invalid subscription object' });
      }

      // Prepare the notification payload
      const payload = JSON.stringify({
        title: 'New Task Added',
        message: `Task "${title}" has been added successfully.`,
        dueDate: parsedDueDate ? parsedDueDate.toISOString() : null,
        priority,
        status
      });

      // Send the notification
      try {
        await webpush.sendNotification(user.subscription, payload);
        console.log('Notification sent');
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }
    } else {
      console.warn('No subscription found for the user');
    }

    // Respond with the new task
    res.status(201).json({ task: newTask });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Error creating task' });
  }
};

// Get Tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ date: 'desc' });
    res.status(200).json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const user = await User.findById(req.user.id);
    if (user && user.subscription) {
      const { endpoint, keys } = user.subscription;

      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        console.warn('Invalid subscription object:', user.subscription);
        return res.status(400).json({ error: 'Invalid subscription object' });
      }

      const payload = JSON.stringify({
        title: 'Task Updated',
        message: `Task "${updatedTask.title}" has been updated.`,
        dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : null,
        priority: updatedTask.priority,
        status: updatedTask.status
      });

      try {
        await webpush.sendNotification(user.subscription, payload);
        console.log('Update notification sent');
      } catch (notificationError) {
        console.error('Error sending update notification:', notificationError);
      }
    } else {
      console.warn('No subscription found for the user');
    }

    res.status(200).json({ task: updatedTask });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Error updating task' });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: 'Task removed' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Error deleting task' });
  }
};
