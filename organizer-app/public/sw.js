// Listen for push events
self.addEventListener('push', function(event) {
  // Parse the notification payload
  let data = {};
  try {
    data = event.data && event.data.text() ? event.data.json() : {};
  } catch (e) {
    console.error('Failed to parse push data', e);
  }

  // Define default values
  const title = data.title || 'Default Title';
  const message = data.message || 'Default message';
  const icon = data.icon || 'path/to/icon.png'; 
  const badge = data.badge || 'path/to/badge.png'; 

  // Prepare options for the notification
  const options = {
    body: message,
    icon: icon,
    badge: badge,
    vibrate: [200, 100, 200], 
    tag: 'notification-tag', 
    actions: [
      {
        action: 'open_url',
        title: 'Open',
        icon: 'path/to/open_icon.png' 
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
  event.notification.close();

  // Handle different actions based on action identifiers
  const urlToOpen = 'http://localhost:3000'; // Default URL

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close events (Optional)
self.addEventListener('notificationclose', function(event) {
  // You can handle any cleanup or analytics logging here
  console.log('Notification was closed', event);
});
