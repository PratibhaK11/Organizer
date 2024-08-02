const cron = require('node-cron');
const webpush = require('../config/webPush');
const Task = require('../models/Task');
const User = require('../models/User');

// Function to send reminders
const sendReminders = async () => {
  const now = new Date();
  console.log(`Current time (UTC): ${now.toISOString()}`);

  // Reinitialize `now` to avoid side effects
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  try {
    // Find tasks due today with alarm set
    const tasks = await Task.find({
      dueDate: { $gte: startOfDay, $lt: endOfDay },
      alarm: true
    }).populate('user');

    if (tasks.length === 0) {
      console.log('No tasks found for reminder.');
      return;
    }

    console.log('Tasks found for reminder:', tasks.length);

    // Process each task
    await Promise.all(tasks.map(async (task) => {
      const user = task.user;

      if (!user || !user.subscription) {
        console.warn(`No subscription found for user: ${user ? user._id : 'Unknown'}`);
        return;
      }

      const { subscription } = user;

      // Validate subscription object
      if (subscription.endpoint && subscription.keys && subscription.keys.p256dh && subscription.keys.auth) {
        const payload = JSON.stringify({
          title: 'Task Reminder',
          message: `Task "${task.title}" is due soon.`
        });

        try {
          await webpush.sendNotification(subscription, payload);
          console.log(`Reminder sent for task: ${task.title}`);
        } catch (error) {
          console.error(`Error sending reminder for task "${task.title}":`, error);

          // Handle 410 Gone errors and remove invalid subscriptions
          if (error.statusCode === 410) {
            console.log(`Subscription expired for user ${user._id}, removing...`);
            user.subscription = null; // Remove the subscription
            await user.save(); // Save changes
          }
        }
      } else {
        console.warn(`Invalid subscription found for user ${user._id}`);
        user.subscription = null; // Clear invalid subscription
        await user.save(); // Save changes
      }
    }));
  } catch (error) {
    console.error('Error fetching tasks for reminders:', error);
  }
};

// Schedule to run every minute
cron.schedule('* * * * *', sendReminders);

module.exports = cron;
