import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bhoomisetu_token'));
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);

  // Fetch demo users for the 1-click evaluator switcher
  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const res = await api.get('/auth/demo-users');
        if (res.success && res.data?.demoUsers) {
          setDemoUsers(res.data.demoUsers);
        }
      } catch (err) {
        console.error('Failed to load demo users:', err);
      }
    };
    fetchDemoUsers();
  }, []);

  // Validate active session
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('bhoomisetu_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        localStorage.setItem('bhoomisetu_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const switchRole = async (role) => {
    try {
      const res = await api.post('/auth/switch-role', { role });
      if (res.success && res.data) {
        localStorage.setItem('bhoomisetu_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Profile update failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Profile update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Password change failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Password change failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('bhoomisetu_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        demoUsers,
        login,
        logout,
        switchRole,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
