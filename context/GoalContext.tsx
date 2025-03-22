import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { Goal } from "@/types/types";
import { useGlobalContext } from "./Context";
import { getUserGoals } from "@/lib/supabase_goals";

interface GoalContextInterface {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  hasGoals: boolean;
  setHasGoals: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading_goal: boolean;
  setLoading_goal: React.Dispatch<React.SetStateAction<boolean>>;
  
}

const defaultGoals: Goal[] = [];

const GoalContext = createContext<GoalContextInterface | undefined>(
  undefined
);

export const useGoalContext = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error("useGoalContext must be used within a GlobalProvider");
  }
  return context;
};

interface GlobalProviderProps {
  children: ReactNode;
}

export default function GoalProvider({ children }: GlobalProviderProps) {
  const { user, isLoggedIn } = useGlobalContext();

  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [hasGoals, setHasGoals] = useState(false);
  const [isLoading_goal, setLoading_goal] = useState(true);

  const fetchGoals = async () => {
    if (!user.userId) return;
    setLoading_goal(true);
    try {
      const goalsData = await getUserGoals(user.userId);
      setGoals(goalsData);
    } catch (error) {
      return error;
    } finally {
        setLoading_goal(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user.userId) {
        fetchGoals();
    }
  }, [isLoggedIn, user.userId]);

  return (
    <GoalContext.Provider
      value={{
        goals,
        setGoals,
        hasGoals,
        setHasGoals,
        isLoading_goal,
        setLoading_goal,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}
