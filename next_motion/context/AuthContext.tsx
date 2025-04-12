"use client";

import React, { createContext, useContext, useEffect, useState , useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  user: UserProfile | null;
  fetchUser: () => Promise<void>;
  loadingUser: boolean;
  userError: string | null;
}
interface UserProfile {
  username: string;
  email: string;
  developmentType: string;
  experienceLevel: string;
  profileImage: string | null;
  thumbnailImage: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = "http://localhost:3001/api/actions";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const router = useRouter();

  // Load authentication state from localStorage on app initialization
  useEffect(() => {
    const storedAuthState = localStorage.getItem("isAuthenticated");
    if (storedAuthState === "true") {
      setIsAuthenticated(true);
    }
    setIsInitialized(true); // Mark initialization as complete
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    router.push("/pages/authPages/LoginPage");
  };
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get<{ message: string; user: UserProfile }>(
        `${API_BASE_URL}/getUser`,
        { withCredentials: true }
      );
      setUser(data.user);
    } catch (err) {
      setUserError("Failed to fetch user data.");
      console.error(err);
    }
  }, []); // Empty dependency array ensures fetchUser is stable
 
 


  if (!isInitialized) {
    return <div className="min-h-screen bg-black"></div>;
  }
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        fetchUser,
        loadingUser,
        userError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};