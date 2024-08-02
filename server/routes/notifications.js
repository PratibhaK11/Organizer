const express = require('express');
const router = express.Router();
const webpush = require('../config/webPush');
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');

router.use(ensureAuthenticated);

// Check Subscription Route
router.post('/check-subscription', async (req, res) => {
  const { endpoint } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (user && user.subscription && user.subscription.endpoint === endpoint) {
      res.status(200).json({ isSubscribed: true });
    } else {
      res.status(200).json({ isSubscribed: false });
    }
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

// Subscribe Route
router.post('/subscribe', async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.id;

  try {
    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    // Find user and update or set subscription
    const user = await User.findById(userId);
    if (user) {
      user.subscription = subscription;
      await user.save();
    } else {
      // Handle case where user does not exist
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Send Notification Route
router.post('/send', async (req, res) => {
  const { title, message } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.subscription || !user.subscription.endpoint) {
      return res.status(404).json({ error: 'User or subscription not found' });
    }

    const payload = JSON.stringify({ title, message });

    await webpush.sendNotification(user.subscription, payload);
    res.status(200).json({ message: 'Notification sent' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  const { endpoint } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (user) {
      // Remove subscription if it matches
      if (user.subscription && user.subscription.endpoint === endpoint) {
        user.subscription = null;
        await user.save();
      }
      res.status(200).json({ message: 'Unsubscribed successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

module.exports = router;

