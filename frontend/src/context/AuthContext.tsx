import React, { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";
import type { AuthState } from "../types";

interface AuthContextType extends AuthState {
  login: (userId: string, password?: string) => Promise<void>; // Legacy/Admin
  loginWithOtp: (
    phoneNumber: string,
    otp: string,
    requestId?: string
  ) => Promise<void>;
  register: (
    phoneNumber: string,
    username: string,
    otp: string,
    requestId?: string
  ) => Promise<void>;
  sendOtp: (phoneNumber: string) => Promise<any>;
  deleteUser: (userId: string, otp: string) => Promise<void>;
  updateUserProfile: (userId: string, data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    isLoading: true,
  });

  const fetchProfile = async () => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      logout();
      return;
    }

    try {
      const res = await client.get(`/user/${storedUserId}`);
      setState((prev) => ({
        ...prev,
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (e) {
      console.error("Failed to fetch profile", e);
      logout();
    }
  };

  useEffect(() => {
    if (state.token) {
      fetchProfile();
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.token]);

  /*
   * Updated login to accept password.
   * Note: We are using "pass123" as the mock password in backend.
   */
  const login = async (userId: string, password?: string) => {
    try {
      // Mocking the original login flow calling the backend
      const res = await client.post("/auth/login", { userId, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.userId);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      console.error("Login failed", e);
      throw e.response?.data?.error || "Login Failed";
    }
  };

  // --- NEW AUTH METHODS (MOCKED) ---

  const sendOtp = async (phoneNumber: string, isLogin: boolean = true) => {
    try {
      const res = await client.post("/auth/send-otp", { phoneNumber, isLogin });
      return res.data;
    } catch (e: any) {
      console.error("Failed to send OTP", e);
      // Propagate string error if possible
      const errorMessage =
        typeof e === "string"
          ? e
          : e.response?.data?.error || "Failed to send OTP";
      throw errorMessage;
    }
  };

  const loginWithOtp = async (
    phoneNumber: string,
    otp: string,
    requestId?: string
  ) => {
    try {
      const res = await client.post("/auth/login-otp", {
        phoneNumber,
        otp,
        requestId,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.userId);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      console.error("Login with OTP failed", e);
      const errorMessage =
        typeof e === "string" ? e : e.response?.data?.error || "Login Failed";
      throw errorMessage;
    }
  };

  const register = async (
    phoneNumber: string,
    username: string,
    otp: string,
    requestId?: string
  ) => {
    try {
      const res = await client.post("/auth/register", {
        phoneNumber,
        username,
        otp,
        requestId,
      });
      const { token, user } = res.data;

      // API Expectation: Backend should return user object on successful register.
      if (!user) {
        throw new Error("Registration succeeded but no user returned");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.userId);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      console.error("Registration failed", e);
      throw e.response?.data?.error || "Registration Failed";
    }
  };

  const deleteUser = async (userId: string, otp: string) => {
    try {
      await client.post("/user/delete", { userId, otp });
      logout();
    } catch (e: any) {
      console.error("Delete failed", e);
      throw e.response?.data?.error || "Delete Failed";
    }
  };

  const updateUserProfile = async (userId: string, data: any) => {
    try {
      const payload = { currentUserId: userId, ...data };
      const res = await client.put("/user/profile", payload);
      if (res.data.success) {
        setState((prev) => ({
          ...prev,
          user: res.data.user || { ...prev.user, ...data },
        }));
      }
    } catch (e: any) {
      console.error("Update profile failed", e);
      throw e.response?.data?.error || "Update Failed";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshProfile: fetchProfile,
        loginWithOtp,
        register,
        sendOtp,
        deleteUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
