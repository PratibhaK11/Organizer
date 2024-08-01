const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Make user optional
  },
  categories: {
    type: [String], 
    default: []
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'], // Priority levels
    default: 'low'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'], // Task statuses
    default: 'Not Started'
  },
  reminder: {
    type: Date 
  },
  alarm: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying based on dueDate
TaskSchema.index({ dueDate: 1 });

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
