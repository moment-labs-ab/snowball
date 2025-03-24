import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { getCurrentUser } from "@/lib/supabase";
import { Habit, HabitTrackingEntry } from "@/types/types";
import { useGlobalContext } from "./Context";
import { useHabitContext } from "./HabitContext";
import { getGridTrackingHistory } from "@/lib/supabase_progress";

interface TrackingContextInterface {
  tracking: { [key: string]: HabitTrackingEntry[] };
  setTracking: React.Dispatch<
    React.SetStateAction<{ [key: string]: HabitTrackingEntry[] }>
  >;
  hasTracking: boolean;
  setHasTracking: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingTracking: boolean;
  setLoadingTracking: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultTracking: { [key: string]: HabitTrackingEntry[] } = {};

const TrackingContext = createContext<TrackingContextInterface | undefined>(
  undefined
);

export const useTrackingContext = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error("useTrackingContext must be used within a GlobalProvider");
  }
  return context;
};

interface GlobalProviderProps {
  children: ReactNode;
}

export default function TrackingProvider({ children }: GlobalProviderProps) {
  const { user, isLoggedIn } = useGlobalContext();

  const { habits, setHabits, isLoading } = useHabitContext();
  const [hasTracking, setHasTracking] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [tracking, setTracking] = useState<{
    [key: string]: HabitTrackingEntry[];
  }>({});
  const [isLoadingTracking, setLoadingTracking] = useState(false);

  function getLastMonth(date: Date): Date {
    const lastMonthDate = new Date(date);
    lastMonthDate.setDate(lastMonthDate.getDate() - 100);
    setStartDate(lastMonthDate);
    return lastMonthDate;
  }

  const fetchGridData = async (startDate: Date, today: Date) => {
    const data: { [key: string]: HabitTrackingEntry[] } = {};

    if (habits.length > 0) {
      for (const habit of habits) {
        try {
          const habitData = await getGridTrackingHistory(
            user.userId,
            habit.id,
            startDate,
            today
          );
          if (habitData && Array.isArray(habitData)) {
            data[habit.id] = habitData;
          }
        } catch {
          const habitData = null;
        }
      }
      //console.log(data)

      setTracking(data);
      setHasTracking(true);
      setLoadingTracking(false);
    }
  };

  useEffect(() => {
    setLoadingTracking(true);
    if (!isLoggedIn || !user?.userId) return;

    const today = new Date();
    const oneMonthAgo = getLastMonth(today);
    fetchGridData(oneMonthAgo, today).then(()=>{setLoadingTracking(false)});
  }, [isLoggedIn, user?.userId, habits.length]);

  return (
    <TrackingContext.Provider
      value={{
        tracking,
        setTracking,
        hasTracking,
        setHasTracking,
        isLoadingTracking,
        setLoadingTracking,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}
