import { View, Text, TextInput, FlatList, ScrollView, StyleSheet} from 'react-native'
import React, {useState, useEffect} from 'react'
import { Habit, HabitTrackingEntry } from '@/types/types'
import { getUserHabits, listenToHabitsTable } from '@/lib/supabase_habits'
import { getGridTrackingHistory, listenToTrackingHistory } from '@/lib/supabase_progress'
import { useGlobalContext } from '@/context/Context'
import { DateTime } from 'luxon';
import { FlashList } from "@shopify/flash-list";
import { eventEmitter } from './DailyHabitDisplay';
import HeatCalendar5x7 from './HeatCalendar5x7'
import { SafeAreaView } from 'react-native-safe-area-context'

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
      lastMonthDate.setDate(lastMonthDate.getDate() - 34);
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

        const listener = eventEmitter.addListener('dataChanged', () => {
          // Perform refresh logic
          //console.log("Event Emitter")
          fetchHabits();
        });
        
       

        const unsubscribe = listenToHabitsTable((payload) => {
          console.log('Change received!', payload);

          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                console.log("Tracking Display Habit INSERT")
                  setHabits(prevHabits => [...prevHabits, payload.new]);
              }
              break;
            case 'UPDATE':
              if (payload.new) {
                console.log("Tracking Display Habit UPDATE")
                  setHabits(prevHabits => 
                      prevHabits.map(habit => habit.id === payload.new.id ? payload.new : habit)
                    );
              }
              break;
            case 'DELETE':
              if (payload.old) {
                console.log("Tracking Display Habit DELETE")
                  setHabits(prevHabits => prevHabits.filter(habit => habit.id !== payload.old.id));
              }
              break;
          }
        });

        // Cleanup subscription on unmount
        return () => {
          unsubscribe();
          listener.off;
        };

        
    }, [user.userId, habits.length])

    useEffect(() => {
      const fetchGridData = async () => {
        const data: { [key: string]: HabitTrackingEntry[] } = {};
    
        if (habits.length > 0) {
          for (const habit of habits) {
            try{
              console.log("Calling getGridTrackingHistory")
              const habitData = await getGridTrackingHistory(user.userId, habit.id, startDate, endDate);
              if (habitData && Array.isArray(habitData)) {
                data[habit.id] = habitData;
              }
            }catch{
              const habitData = null
            }

          }
    
          // Temporarily comment out setGridData and test with an empty object
          setGridData(data); // Or try: setGridData({});
        }
      };
    
      if (habits.length > 0) {
        fetchGridData();
      }else{
        fetchGridData();
      }

      const unsubscribe = listenToTrackingHistory((payload) => {
        console.log('Change received in Progress!', payload);
        fetchGridData();
        switch (payload.eventType) {
          case 'INSERT':
            console.log("New Tracking Picked Up! INSERT")
            //handleRefresh(payload.habitId, payload.new);
          case 'UPDATE':
            console.log("New Tracking Picked Up! UPDATE")
            //handleRefresh(payload.habitId, payload.new);
          case 'DELETE':
            console.log("New Tracking Picked Up! DELETE")
            //handleRefresh(payload.habitId, payload.new);
            break;
        }
      });

      return () => {
        unsubscribe();
      };
    }, [habits.length, startDate, endDate]);



 

  return (
  
    <FlashList 
            data={habits}
            keyExtractor={(item) => item.id}
            extraData={gridData}
            renderItem={({ item }) => {
              const habitData = gridData[item.id];
              
            
              return (
                <View style={{ marginBottom: 50 }}>
                  <View>
                    {habitData ? (
                      <HeatCalendar5x7
                      data={habitData}
                      habitName={item.name}
                      frequency={item.frequency}
                      frequencyRate={item.frequency_rate}/>
                    ) : (
                      <Text>Loading...</Text>
                    )}
                  </View>
                </View>
              );
            }}
            estimatedItemSize={80}
            nestedScrollEnabled={true}
            />
  

  )
}

export default TrackingDisplay;

{/**<View>
                    {habitData ? (
                      <HeatCalendar data={habitData} />
                    ) : (
                      <Text>Loading...</Text>
                    )}
                  </View> */}

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