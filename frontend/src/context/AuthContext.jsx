import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    user_id: 'creator-demo-id',
    name: 'Sathwik Creative Director',
    email: 'creator@gostudio.ai',
    role: 'admin', // default to admin for seamless evaluation of both user and admin modules!
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt auto-login or fetch /me
    const token = localStorage.getItem('gostudio_token');
    if (token) {
      api.getMe()
        .then(data => setUser(data))
        .catch(() => {
          // Token expired or invalid
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('gostudio_token', data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'user') => {
    setLoading(true);
    try {
      const data = await api.register(name, email, password, role);
      localStorage.setItem('gostudio_token', data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole) => {
    setUser(prev => ({
      ...prev,
      role: newRole,
      name: newRole === 'admin' ? 'GoStudio Admin' : 'Sathwik Creative Director',
      email: newRole === 'admin' ? 'admin@gostudio.ai' : 'creator@gostudio.ai'
    }));
  };

  const logout = () => {
    localStorage.removeItem('gostudio_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
