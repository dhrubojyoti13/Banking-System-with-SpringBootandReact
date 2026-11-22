
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";
import type { AuthResponse } from "../types";

interface RegisterPayload {
  fullName: string;
  pin: string;
}

interface LoginPayload {
  accountNumber: string;
  pin: string;
}

interface AuthContextValue {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): AuthResponse | null {
  const raw = sessionStorage.getItem("banking_user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    sessionStorage.removeItem("banking_user");
    sessionStorage.removeItem("banking_token");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(getStoredUser);

  // Save authentication details after successful login or registration
  const saveSession = (response: AuthResponse) => {
    sessionStorage.setItem("banking_token", response.token);
    sessionStorage.setItem("banking_user", JSON.stringify(response));

    setUser(response);
  };

  // LOGIN
  const login = async (payload: LoginPayload): Promise<void> => {
    const { data } = await api.post<AuthResponse>(
      "/api/auth/login",
      payload
    );

    saveSession(data);
  };

  // REGISTER
  const register = async (
    payload: RegisterPayload
  ): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
      "/api/auth/register",
      payload
    );

    saveSession(data);

    return data;
  };

  // LOGOUT
  const logout = () => {
    sessionStorage.removeItem("banking_token");
    sessionStorage.removeItem("banking_user");

    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      login,
      register,
      logout,
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}


// import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
// import api from "../services/api";
// import type { AuthResponse } from "../types";

// interface RegisterPayload {
//   fullName: string;
//   pin: string;
// }
// interface LoginPayload {
//   accountNumber: string;
//   pin: string;
// }
// interface AuthContextValue {
//   user: AuthResponse | null;
//   isAuthenticated: boolean;
//   login: (payload: LoginPayload) => Promise<void>;
//   register: (payload: RegisterPayload) => Promise<AuthResponse>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// function getStoredUser(): AuthResponse | null {
//   const raw = sessionStorage.getItem("banking_user");
//   if (!raw) return null;
//   try { return JSON.parse(raw) as AuthResponse; }
//   catch { sessionStorage.removeItem("banking_user"); return null; }
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthResponse | null>(getStoredUser);

//   const saveSession = (response: AuthResponse) => {
//     sessionStorage.setItem("banking_token", response.token);
//     sessionStorage.setItem("banking_user", JSON.stringify(response));
//     setUser(response);
//   };

//   const login = async (accountNumber: string, pin: string) => {
//   const response = await api.post("/api/auth/login", {
//     accountNumber,
//     pin,
//   });

//   sessionStorage.setItem("banking_token", response.data.token);

//   return response.data;
// };
//   // const login = async (payload: LoginPayload) => {
//   //   const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
//   //   saveSession(data);
//   // };

//   const register = async (fullName: string, pin: string) => {
//   const response = await api.post("/api/auth/register", {
//     fullName,
//     pin,
//   });

//   return response.data;
// };
//   // const register = async (payload: RegisterPayload) => {
//   //   const { data } = await api.post<AuthResponse>("/api/auth/register", payload);
//   //   saveSession(data);
//   //   return data;
//   // };

//   const logout = () => {
//     sessionStorage.removeItem("banking_token");
//     sessionStorage.removeItem("banking_user");
//     setUser(null);
//   };

//   const value = useMemo(() => ({
//     user, isAuthenticated: Boolean(user?.token), login, register, logout
//   }), [user]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used inside AuthProvider");
//   return context;
// }