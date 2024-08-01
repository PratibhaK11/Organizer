self.addEventListener('push', function(event) {
  // Parse the notification payload
  const data = event.data ? event.data.json() : {};

  // Define default values
  const title = data.title || 'Default Title';
  const message = data.message || 'Default message';
  const icon = data.icon || 'path/to/icon.png'; // Optional: Use provided icon or fallback
  const badge = data.badge || 'path/to/badge.png'; // Optional: Use provided badge or fallback

  // Prepare options for the notification
  const options = {
    body: message,
    icon: icon,
    badge: badge,
    // Other notification options can be added here
    vibrate: [200, 100, 200], // Example vibration pattern
    tag: 'notification-tag', // Tag to differentiate notifications
    actions: [
      {
        action: 'open_url',
        title: 'Open',
        icon: 'path/to/open_icon.png' // Optional: Action icon
      }
    ]
  };

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  // Close the notification
  event.notification.close();

  // Handle different actions based on action identifiers
  if (event.action === 'open_url') {
    // Open a specific URL when the "Open" action is clicked
    event.waitUntil(
      clients.openWindow('http://localhost:3000') // URL to open
    );
  } else {
    // Default action if no specific action is matched
    event.waitUntil(
      clients.openWindow('http://localhost:3000') // URL to open
    );
  }
});
