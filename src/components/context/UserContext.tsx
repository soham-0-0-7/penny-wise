// context/UserContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface UserContextType {
  username: string;
  userincome: string;
  email: string;
  setUsername: (name: string) => void;
  setUserincome: (income: string) => void;
  setEmail: (email: string) => void;
  isHydrated: boolean;
  clearUser: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState("");
  const [userincome, setUserincome] = useState("");
  const [email, setEmail] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load user data from sessionStorage on mount
  useEffect(() => {
    const savedUsername = sessionStorage.getItem("username") || "";
    const savedUserincome = sessionStorage.getItem("userincome") || "";
    const savedemail = sessionStorage.getItem("email") || "";

    setUsername(savedUsername);
    setUserincome(savedUserincome);
    setEmail(savedemail);
    setIsHydrated(true);
  }, []);

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("userincome", userincome);
      sessionStorage.setItem("email", email);
    }
  }, [username, userincome, email, isHydrated]);

  const clearUser = () => {
    setUsername("");
    setUserincome("");
    setEmail("");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userincome");
    sessionStorage.removeItem("email");
  };

  const isLoggedIn = email !== "";

  return (
    <UserContext.Provider
      value={{
        username,
        userincome,
        email,
        setUsername,
        setUserincome,
        setEmail,
        isHydrated,
        clearUser,
        isLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
