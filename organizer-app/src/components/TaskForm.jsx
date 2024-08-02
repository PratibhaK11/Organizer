import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskForm = ({ setTasks, editingTask, setEditingTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('low');
  const [status, setStatus] = useState('Not Started');
  const [categories, setCategories] = useState([]);
  const [alarm, setAlarm] = useState(false);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setCategories(editingTask.categories || []); // Ensure categories is an array
      setAlarm(editingTask.alarm || false); // Default to false if not provided
    } else {
      // Clear the form if no task is being edited
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('low');
    setStatus('Not Started');
    setCategories([]);
    setAlarm(false);
    setError(null); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Update existing task
        await axios.patch(`/api/tasks/${editingTask._id}`, {
          title,
          description,
          dueDate,
          priority,
          status,
          categories,
          alarm
        });
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === editingTask._id ? { ...task, title, description, dueDate, priority, status, categories, alarm } : task
          )
        );
        setEditingTask(null); // Clear editing task
      } else {
        // Add new task
        const response = await axios.post('/api/tasks/add', {
          title,
          description,
          dueDate,
          priority,
          status,
          categories,
          alarm
        });
        setTasks(prevTasks => [...prevTasks, response.data.task]);
      }
      // Reset form
      resetForm();
    } catch (error) {
      setError('Error saving task. Please try again.'); // Set error message
      console.error('Error saving task:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {editingTask ? 'Edit Task' : 'New Task'}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>} {/* Display error message */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col mb-4">
          <label htmlFor="title" className="font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="flex flex-col mb-4">
          <label htmlFor="description" className="font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="dueDate" className="font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 w-full"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="priority" className="font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="status" className="font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 w-full"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col mb-4">
          <label htmlFor="categories" className="font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</label>
          <input
            type="text"
            id="categories"
            value={categories.join(', ')}
            onChange={(e) => setCategories(e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat))}
            placeholder="Enter categories, separated by commas"
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="alarm"
            checked={alarm}
            onChange={(e) => setAlarm(e.target.checked)}
            className="h-5 w-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:ring-offset-gray-800"
          />
          <label htmlFor="alarm" className="ml-3 text-gray-700 dark:text-gray-300">Set Alarm</label>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
