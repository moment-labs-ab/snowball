import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { getCurrentUser } from "@/lib/supabase_user";
import { User } from "@/types/types";
import { initSupabaseClient } from "@/lib/supabase";
import { initRevenueCat } from "@/lib/revenue_cat";

interface GlobalContextInterface {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultUser: User = { username: "", name: "", email: "", userId: "", premiumUser: false, expoPushToken: "", notificationTime: "" };

const GlobalContext = createContext<GlobalContextInterface | undefined>(undefined);

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};

interface GlobalProviderProps {
    children: ReactNode;
}

export default function GlobalProvider({ children }: GlobalProviderProps) {
    const [user, setUser] = useState<User>(defaultUser);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function preLoadingSteps() {
            try {
                await initSupabaseClient();

                const result = await getCurrentUser();
                if (result) {

                    await initRevenueCat(result.email || "");
                    setUser({
                        email: result.email || "",
                        username: result.username || "",
                        name: result.name || "",
                        userId: result.userId || "",
                        premiumUser: result.premiumUser || false,
                        expoPushToken: result.expoPushToken || "",
                        notificationTime: result.notificationTime || "",
                    });
                    setIsLoggedIn(true);
                } else {
                    setUser(defaultUser);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
            finally {
                setIsLoading(false);
            }
        }

        preLoadingSteps();
    }, []);

    return (
        <GlobalContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn, isLoading, setIsLoading }}>
            {children}
        </GlobalContext.Provider>
    );
}
