import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agritech_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agritech_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('agritech_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('agritech_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('agritech_token', newToken);
      localStorage.setItem('agritech_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('agritech_token', newToken);
      localStorage.setItem('agritech_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data.message };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('agritech_token');
    localStorage.removeItem('agritech_user');
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('agritech_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data.message };
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/auth/password', { currentPassword, newPassword });
    if (res.data.success) {
      return { success: true, message: res.data.message };
    }
    return { success: false, message: res.data.message };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
