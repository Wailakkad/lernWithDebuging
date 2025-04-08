"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load authentication state from localStorage on app initialization
  useEffect(() => {
    const checkAuth = async () => {
      // Simulate a small delay to prevent flash of loading screen for quick loads
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const storedAuthState = localStorage.getItem("isAuthenticated");
      if (storedAuthState === "true") {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center">
          {/* Pulsating Circle Animation */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#90ee90] animate-pulse opacity-70"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <div className="w-12 h-12 border-t-4 border-r-4 border-[#90ee90] rounded-full animate-spin"></div>
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="mt-6 text-[#90ee90] text-lg font-medium tracking-wider">
            LOADING
            <span className="inline-flex ml-1">
              <span className="animate-pulse delay-100">.</span>
              <span className="animate-pulse delay-200">.</span>
              <span className="animate-pulse delay-300">.</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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