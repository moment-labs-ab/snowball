import React, { createContext, useContext, useState, useEffect, ReactNode, FC } from "react";
import { Text } from "react-native";
import { Session, User } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase";

interface GlobalContextType {
    isLoggedIn: boolean;
    user: Session | null;
    isLoading: boolean;
  }

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};


const GlobalProvider: React.FC<{children: React.ReactNode}> = ({children}) =>{
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<User |null>(Session.user)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
          try {
            const res = await getCurrentUser();
            if (res) {
              setIsLoggedIn(true);
              setUser(res);
            }
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchUser();
      }, []);


    return (
        <GlobalContext.Provider value={{ isLoggedIn, user, isLoading }}>
        {children}
      </GlobalContext.Provider>

    )
}

export default GlobalProvider;

