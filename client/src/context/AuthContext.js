import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Set axios Authorization header when token changes (including on app load)
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = resp.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setAuthToken(newToken);
      setToken(newToken);
      setUser(newUser);
      setLoading(false);
      return { ok: true };
    } catch (e) {
      setLoading(false);
      return { ok: false, message: e.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const resp = await api.post('/auth/register', { name, email, password });
      const { token: newToken, user: newUser } = resp.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setAuthToken(newToken);
      setToken(newToken);
      setUser(newUser);
      setLoading(false);
      return { ok: true };
    } catch (e) {
      setLoading(false);
      return { ok: false, message: e.response?.data?.message || 'Register failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
