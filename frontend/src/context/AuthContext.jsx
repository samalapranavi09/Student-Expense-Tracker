import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Create dedicated API axios instance
export const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios interceptor to append authorization token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('student_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('student_token');
      localStorage.removeItem('student_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for cached token and user in localStorage on mount
    const savedToken = localStorage.getItem('student_token');
    const savedUser = localStorage.getItem('student_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error parsing cached user:', err);
        // Clear corrupt state
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_user');
      }
    }
    setLoading(false);
  }, []);

  // Register Function
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('student_token', receivedToken);
      localStorage.setItem('student_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const errMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
      return { success: false, error: errMsg };
    }
  };

  // Login Function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('student_token', receivedToken);
      localStorage.setItem('student_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const errMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Login failed';
      return { success: false, error: errMsg };
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
