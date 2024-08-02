import React, { useState, useEffect } from 'react';

// Convert a base64 string to a Uint8Array
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

// Subscribe the user to push notifications
export const subscribeUser = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      // Ensure service worker is ready
      const registration = await navigator.serviceWorker.ready;
      
      // Check if there is an existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        // Check if the subscription is already stored on the server
        const response = await fetch('/api/notifications/check-subscription', {
          method: 'POST',
          body: JSON.stringify({ endpoint: existingSubscription.endpoint }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const responseData = await response.json();
          if (responseData.isSubscribed) {
            console.log('User is already subscribed');
            return;
          }
        } else {
          throw new Error(`Server responded with status ${response.status}`);
        }
      }

      // Subscribe the user
      const applicationServerKey = urlBase64ToUint8Array('BA36MmQvZeXCN6SoOkl5JeSVK0ADziCwPOEINUasNfAGOh10wV3CoqHVx7dZBuYQY4TsC_k578Ro3W4djca2GFs');
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // Format subscription for server
      const pushSubscription = {
        endpoint: newSubscription.endpoint,
        expirationTime: newSubscription.expirationTime,
        keys: {
          p256dh: newSubscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('p256dh')))) : '',
          auth: newSubscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('auth')))) : ''
        }
      };

      // Send the subscription to your server
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

// Unsubscribe the user from push notifications
export const unsubscribeUser = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Notify the server to remove the subscription
        const response = await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        console.log('User unsubscribed successfully.');
      } else {
        console.log('No subscription found.');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  } else {
    console.warn('Push notifications or service worker are not supported in this browser.');
  }
};
