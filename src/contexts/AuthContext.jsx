import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.non_field_errors?.[0] || 
                    error.response?.data?.username?.[0] ||
                    error.response?.data?.password?.[0] ||
                    'Erreur de connexion';
      return { success: false, message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errors = error.response?.data;
      let message = 'Erreur lors de l\'inscription';
      
      if (errors) {
        if (errors.username) message = errors.username[0];
        else if (errors.email) message = errors.email[0];
        else if (errors.password) message = errors.password[0];
        else if (errors.non_field_errors) message = errors.non_field_errors[0];
      }
      
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};