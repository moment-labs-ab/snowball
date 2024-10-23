import { View, Text, TextInput, FlatList, ScrollView } from 'react-native'
import React, {useState, useEffect} from 'react'
import { Habit, HabitTrackingEntry } from '@/types/types'
import { getUserHabits, listenToHabitsTable } from '@/lib/supabase_habits'
import { getGridTrackingHistory } from '@/lib/supabase_progress'
import { useGlobalContext } from '@/context/Context'
import { DateTime } from 'luxon';
import { FlashList } from "@shopify/flash-list";


const TrackingDisplay = () => {
    const { user, isLoading } = useGlobalContext();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [lastHabit, setLastHabit] = useState("")
    const [habitsLength, setHabitsLength] = useState(0)
    const [loading, setLoading] = useState<boolean>(true);
    const [endDate, setEndDate] = useState<Date>(new Date())
    const [startDate, setStartDate] = useState<Date>(new Date())
    const [gridData, setGridData] = useState<{ [key: string]: HabitTrackingEntry[] }>({});


    const luxonDate = DateTime // Automatically uses user's local time zone
    
    const now = new Date()
    const today = new Date(now.toDateString())
    const oneMonthAgo = getLastMonth(endDate)

    function getLastMonth(date: Date): Date {
      const lastMonthDate = new Date(date);
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      return lastMonthDate;
    }
    
     // Automatically uses user's local time zone
    //console.log(today.toString()); 

    useEffect(()=>{
      setEndDate(today)
      setStartDate(oneMonthAgo)

      const fetchHabits = async () => {
        const habitsData = await getUserHabits(user.userId);
        setHabits(habitsData);
        setLoading(false);
        };

        fetchHabits();
        
       

        const unsubscribe = listenToHabitsTable((payload) => {
          console.log('Change received!', payload);

          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                  setHabits(prevHabits => [...prevHabits, payload.new]);
              }
              break;
            case 'UPDATE':
              if (payload.new) {
                  setHabits(prevHabits => 
                      prevHabits.map(habit => habit.id === payload.new.id ? payload.new : habit)
                    );
              }
              break;
            case 'DELETE':
              if (payload.old) {
                  setHabits(prevHabits => prevHabits.filter(habit => habit.id !== payload.old.id));
              }
              break;
          }
        });

        // Cleanup subscription on unmount
        return () => {
          unsubscribe();
        };

        
    }, [user.userId, habits.length])

    useEffect(()=>{
      const fetchGridData = async () => {
        const data: { [key: string]: HabitTrackingEntry[] } = {};
        if (habits.length > 0){
          for (const habit of habits) {
            const habitData = await getGridTrackingHistory(user.userId, habit.id, startDate, endDate);
            if(habitData){
              data[habit.id] = habitData; // Store each habit's data by ID
            }
          }
          setGridData(data);

        } // Set the data for all habits at once
      };
  
      if (habits.length > 0) {
        fetchGridData();
      }

    }, [habits, startDate, endDate])



 

  return (

    <FlashList 
            data={habits}
            keyExtractor={(item) => item.id}
            extraData={gridData}
            renderItem={({ item }) => {
              const habitData = gridData[item.id];
                      
            return(
            <View className='flex-row mb-30'>
                <Text>{item.name}</Text>
                <View>
              {habitData ? (
                habitData.map((entry) => (
                  <Text key={entry.date}>
                    {entry.date}: {entry.count} tracked
                  </Text>
                ))
              ) : (
                <Text>Loading...</Text>
              )}
            </View>
            </View>
            )}}
            estimatedItemSize={80}
            />

  )
}

export default TrackingDisplay;

{/**<FlashList 
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
            <View className='flex-row mb-30'>
                <Text>{item.name}</Text>
            </View>
            )}
            estimatedItemSize={80}
            /> */}

{/**   useEffect(() => {
        console.log("USEEFFECT: DailyHabitDisplay")
        const fetchHabits = async () => {
        const habitsData = await getUserHabits(user.userId);
        setHabits(habitsData);
        setLoading(false);
        };

        fetchHabits();
        const unsubscribe = listenToHabitsTable((payload) => {
            console.log('Change received!', payload);

            switch (payload.eventType) {
              case 'INSERT':
                if (payload.new) {
                    setHabits(prevHabits => [...prevHabits, payload.new]);
                }
                break;
              case 'UPDATE':
                if (payload.new) {
                    setHabits(prevHabits => 
                        prevHabits.map(habit => habit.id === payload.new.id ? payload.new : habit)
                      );
                }
                break;
              case 'DELETE':
                if (payload.old) {
                    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== payload.old.id));
                }
                break;
            }
          });

          // Cleanup subscription on unmount
          return () => {
            unsubscribe();
          };
    }, []); */}