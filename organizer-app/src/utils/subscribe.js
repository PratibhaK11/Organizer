const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeUser = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log('User is already subscribed');
        // Optionally: Send request to update subscription if server-side changes
        return;
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BA36MmQvZeXCN6SoOkl5JeSVK0ADziCwPOEINUasNfAGOh10wV3CoqHVx7dZBuYQY4TsC_k578Ro3W4djca2GFs')
      });

      const pushSubscription = {
        endpoint: newSubscription.endpoint,
        expirationTime: newSubscription.expirationTime,
        keys: {
          p256dh: newSubscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('p256dh')))) : '',
          auth: newSubscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('auth')))) : ''
        }
      };

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription: pushSubscription }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Server response:', responseData);

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  } else {
    console.warn('Push notifications or service worker are not supported in this browser.');
  }
};


export const unsubscribeUser = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Notify server to remove subscription
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  } else {
    console.warn('Push notifications or service worker are not supported in this browser.');
  }
};
