import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { getCurrentUser } from "@/lib/supabase";
import { Habit } from "@/types/types";
import { useGlobalContext } from "./Context";
import { getUserHabits } from "@/lib/supabase_habits";

interface HabitContextInterface {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  hasHabits: boolean;
  setHasHabits: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultHabits: Habit[] = [];

const HabitContext = createContext<HabitContextInterface | undefined>(
  undefined
);

export const useHabitContext = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error("useHabitContext must be used within a GlobalProvider");
  }
  return context;
};

interface GlobalProviderProps {
  children: ReactNode;
}

export default function HabitProvider({ children }: GlobalProviderProps) {
  const { user, isLoggedIn } = useGlobalContext();

  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [hasHabits, setHasHabits] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const fetchHabits = async () => {
    if (!user.userId) return;
    setLoading(true);
    try {
      const habitsData = await getUserHabits(user.userId);
      setHabits(habitsData);
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user.userId) {
      fetchHabits();
    }
  }, [isLoggedIn, user.userId]);

  return (
    <HabitContext.Provider
      value={{
        habits,
        setHabits,
        hasHabits,
        setHasHabits,
        isLoading,
        setLoading,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}
