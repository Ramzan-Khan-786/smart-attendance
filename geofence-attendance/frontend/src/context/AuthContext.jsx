// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "../api/index.jsx"; // updated path for ES6 modules

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    isAuthenticated: null,
    loading: true,
    user: null,
    isAdmin: false,
  });

  // Load user/admin data if token exists
  const loadUser = async () => {
    if (localStorage.getItem("token")) {
      try {
        let res;
        try {
          // Try to fetch regular user
          res = await api.get("/auth/user");
          setAuth({
            token: localStorage.getItem("token"),
            isAuthenticated: true,
            loading: false,
            user: res.data,
            isAdmin: false,
          });
        } catch (userErr) {
          // If user fails, try admin
          res = await api.get("/auth/admin");
          setAuth({
            token: localStorage.getItem("token"),
            isAuthenticated: true,
            loading: false,
            user: res.data,
            isAdmin: true,
          });
        }
      } catch (err) {
        console.error("Error loading user/admin:", err);
        localStorage.removeItem("token");
        setAuth({
          token: null,
          isAuthenticated: false,
          loading: false,
          user: null,
          isAdmin: false,
        });
      }
    } else {
      setAuth({
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        isAdmin: false,
      });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Login function: saves token and user data
  const login = (token, user, isAdmin = false) => {
    localStorage.setItem("token", token);
    setAuth({
      token,
      isAuthenticated: true,
      loading: false,
      user,
      isAdmin,
    });
  };

  // Logout function: clears token and auth state
  const logout = () => {
    localStorage.removeItem("token");
    setAuth({
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null,
      isAdmin: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, loadUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
