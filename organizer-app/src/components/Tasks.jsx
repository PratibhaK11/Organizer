import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { subscribeUser } from '../utils/subscribe';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskForm from './TaskForm';
import Navbar from './Navbar';
import { FaEdit, FaTrash, FaCheck, FaFilter } from 'react-icons/fa';  // Import icons

const Tasks = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all'); // State to manage priority filter
  const [editingTask, setEditingTask] = useState(null); // State to manage the task being edited

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/tasks');
        console.log('Fetched tasks:', res.data); // Log the response
        setTasks(res.data.tasks || []); // Ensure an empty array if no tasks
        setError(null); // Clear any previous errors
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
        console.error('Error fetching tasks:', err); // Log the error
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    if (user) {
      subscribeUser().catch(err => {
        console.error('Subscription error:', err);
        setError('Failed to subscribe to notifications.');
      });
    }
  }, [user]);

  const deleteTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter((task) => task._id !== id));
    } catch (err) {
      setError('Failed to delete task. Please try again later.');
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAsCompleted = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`/api/tasks/${id}`, { status: 'Completed' });
      setTasks(prevTasks => 
        prevTasks.map(task => (task._id === id ? { ...task, status: 'Completed' } : task))
      );
    } catch (err) {
      setError('Failed to mark task as completed. Please try again later.');
      console.error('Error marking task as completed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedTasks = useMemo(() => {
    return tasks.sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (a.status !== 'Completed' && b.status === 'Completed') return -1;
      return 0;
    });
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return sortedTasks.filter(task => 
      filterPriority === 'all' || task.priority === filterPriority
    );
  }, [sortedTasks, filterPriority]);

  const handleEditClick = (task) => {
    setEditingTask(task);
  };

  const handleFilterClick = () => {
    setFilterPriority(prev => prev === 'all' ? 'high' : 'all');
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar tasks={tasks} setTasks={setTasks} />

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Task Form Section */}
        <div className="flex-1 p-6 bg-gray-100 lg:mr-6 lg:mb-0 mb-6">
          <TaskForm 
            setTasks={setTasks} 
            editingTask={editingTask} 
            setEditingTask={setEditingTask} // Reset the task when updating
          />
        </div>

        {/* Tasks List Section */}
        <div className="flex-1 p-6 bg-white-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Tasks</h2>
            <div className="flex items-center space-x-4">
              <p className="text-gray-600">
                <strong>Pending Tasks:</strong> {filteredTasks.filter(task => task.status === 'Not Started').length}
              </p>
              <button
                onClick={handleFilterClick}
                className="flex items-center bg-gray-300 p-2 rounded"
              >
                <FaFilter className="mr-2" />
                {filterPriority === 'all' ? 'High ' : 'Show All' }
              </button>
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <ul className="space-y-4">
              {filteredTasks.map((task) => (
                <li key={task._id} className={`border border-gray-300 p-4 rounded-md bg-white shadow-sm ${task.status === 'Completed' ? 'line-through' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <p className="text-gray-700">{task.description}</p>
                      <p className="text-gray-600"><strong>Due Date:</strong> {task.dueDate}</p>
                      <p className="text-gray-600"><strong>Priority:</strong> {task.priority}</p>
                      <p className="text-gray-600"><strong>Status:</strong> {task.status}</p>
                      <p className="text-gray-600"><strong>Categories:</strong> {task.categories.join(', ')}</p>
                      {task.alarm && <p className="text-gray-600"><strong>Alarm Set</strong></p>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => markAsCompleted(task._id)}
                        className="bg-green-500 text-white p-2 rounded"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="bg-orangered-500 text-white p-2 rounded"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => handleEditClick(task)}
                        className="bg-black-500 text-white p-2 rounded"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
