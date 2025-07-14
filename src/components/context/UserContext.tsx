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
  useremail: string;
  setUsername: (name: string) => void;
  setUserincome: (income: string) => void;
  setUseremail: (email: string) => void;
  isHydrated: boolean;
  clearUser: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState("");
  const [userincome, setUserincome] = useState("");
  const [useremail, setUseremail] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load user data from sessionStorage on mount
  useEffect(() => {
    const savedUsername = sessionStorage.getItem("username") || "";
    const savedUserincome = sessionStorage.getItem("userincome") || "";
    const savedUseremail = sessionStorage.getItem("useremail") || "";

    setUsername(savedUsername);
    setUserincome(savedUserincome);
    setUseremail(savedUseremail);
    setIsHydrated(true);
  }, []);

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("userincome", userincome);
      sessionStorage.setItem("useremail", useremail);
    }
  }, [username, userincome, useremail, isHydrated]);

  const clearUser = () => {
    setUsername("");
    setUserincome("");
    setUseremail("");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userincome");
    sessionStorage.removeItem("useremail");
  };

  const isLoggedIn = useremail !== "";

  return (
    <UserContext.Provider
      value={{
        username,
        userincome,
        useremail,
        setUsername,
        setUserincome,
        setUseremail,
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
