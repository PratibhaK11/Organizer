import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/users/current', {
          withCredentials: true // Ensure credentials are sent with request
        });
        setUser(res.data.user);
      } catch (err) {
        console.error('Auth check error:', err.response ? err.response.data : err.message); // Log error details
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password }, {
        withCredentials: true // Ensure credentials are sent with request
      });
      setUser(res.data.user);
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message); // Log error details
      throw err;
    }
  };

  const register = async (name, email, password, password2) => {
    try {
      await axios.post('/api/users/register', { name, email, password, password2 }, {
        withCredentials: true // Ensure credentials are sent with request
      });
    } catch (err) {
      console.error('Register error:', err.response ? err.response.data : err.message); // Log error details
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Call unsubscribeUser before logging out
      await unsubscribeUser();
      
      await axios.get('/api/users/logout', {
        withCredentials: true // Ensure credentials are sent with request
      });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err.response ? err.response.data : err.message); // Log error details
      throw err;
    }
  };

  const unsubscribeUser = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();

          // Notify server to remove subscription
          await axios.post('/api/notifications/unsubscribe', {
            endpoint: subscription.endpoint
          }, {
            withCredentials: true
          });
        }
      } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
      }
    } else {
      console.warn('Push notifications or service worker are not supported in this browser.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
