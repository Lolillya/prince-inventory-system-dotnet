import { createContext, useEffect, useState } from "react";
import { UserProfile } from "../models/user.model";
import { registerAPI } from "../features/auth-login/auth-register.service";
// import { toast } from "react-toastify";
import { loginAPI } from "../features/auth-login/auth-login.service";
import React from "react";
import axios from "axios";

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  registerUser: (email: string, username: string, password: string) => void;
  loginUser: (username: string, password: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

const getRoleFromToken = (token: string): string => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["role"] ?? "";
  } catch {
    return "";
  }
};

export const UserProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      setUser({ ...JSON.parse(user), role: getRoleFromToken(token) });
      setToken(token);
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    }
    setIsReady(true);
  }, []);

  const registerUser = async (
    email: string,
    username: string,
    password: string,
  ) => {
    await registerAPI(email, username, password).then((res) => {
      if (res) {
        localStorage.setItem("token", res?.data.token);
        const userObj = {
          username: res?.data.username,
          email: res?.data.email,
          user_ID: res.data.user_ID,
        };
        localStorage.setItem("user", JSON.stringify(userObj));
        setToken(res?.data.token!);
        setUser({ ...userObj, role: getRoleFromToken(res.data.token) });
        // toast.success("Login Success!");
        window.location.href = "/admin/dashboard";
      }
    });
    // .catch((e) => toast.warning("Server error occured", e));
  };

  const loginUser = async (username: string, password: string) => {
    await loginAPI(username, password).then((res) => {
      if (res) {
        localStorage.setItem("token", res?.data.token);
        const userObj = {
          username: res?.data.username,
          email: res?.data.email,
          user_ID: res.data.user_ID,
        };
        localStorage.setItem("user", JSON.stringify(userObj));
        setToken(res?.data.token!);
        setUser({ ...userObj, role: getRoleFromToken(res.data.token) });

        window.location.href = "/admin/dashboard";
      }
    });
    // .catch((e) => toast.warning("Server error occured", e));
  };

  const isLoggedIn = () => {
    return !!user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
    window.location.href = "/";
  };

  return (
    <UserContext.Provider
      value={{ loginUser, user, token, logout, isLoggedIn, registerUser }}
    >
      {isReady ? children : null}
    </UserContext.Provider>
  );
};

export const useAuth = () => React.useContext(UserContext);
