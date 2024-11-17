import { View, Text, TextInput, FlatList, ScrollView } from 'react-native'
import React, {useState, useEffect} from 'react'
import { Habit } from '@/types/types'
import { getUserHabits, listenToHabitsTable, updateHabitOrder } from '@/lib/supabase_habits'
import { useGlobalContext } from '@/context/Context'
import HabitCard from './HabitCard'
import { FlashList } from "@shopify/flash-list";
import { newHabitEmitter, deleteHabitEmitter, habitEmitter } from '@/events/eventEmitters'

type dailyHabitDisplayProps = {
    selectedDate: Date

}

const DailyHabitDisplay = ({selectedDate}: dailyHabitDisplayProps) => {
    const { user, isLoading } = useGlobalContext();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [lastHabit, setLastHabit] = useState("")
    const [habitsLength, setHabitsLength] = useState(0)
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        console.log("USEEFFECT: DailyHabitDisplay")
        const fetchHabits = async () => {
        const habitsData = await getUserHabits(user.userId);
        setHabits(habitsData);
        setLoading(false);
        };

        fetchHabits();

        const listener = newHabitEmitter.addListener('newHabit', () => {
          // Perform refresh logic
          //console.log("Event Emitter")
          fetchHabits();
        });
        const deleteHabitListener = deleteHabitEmitter.addListener('deleteHabit', () => {
          fetchHabits();
        });
        const unsubscribe = listenToHabitsTable((payload) => {
            console.log('Change received!', payload);
            fetchHabits(); 

            switch (payload.eventType) {
              case 'INSERT':
                if (payload.new) {
                  console.log("IN INSERT")
                    setHabits(prevHabits => [...prevHabits, payload.new]);
                }
                break;
              case 'UPDATE':
                if (payload.new) {
                  console.log("IN UPDATE")
                    setHabits(prevHabits => 
                        prevHabits.map(habit => habit.id === payload.new.id ? payload.new : habit)
                      );
                }
                break;
              case 'DELETE':
                if (payload.old) {
                  console.log("IN DELETE")
                    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== payload.old.id));
                }
                break;
            }
          });
          // Cleanup subscription on unmount
          return () => {
            unsubscribe();
            habitEmitter.emit('dataChanged');
          };
    }, [user.userId, selectedDate, habits.length]);

  return (

    <FlashList 
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
            <View className='flex-row mb-30'>
                <HabitCard
                id={item.id}
                name={item.name}
                frequency={item.frequency}
                frequency_rate = {item.frequency_rate}
                created_at={item.created_at}
                reminder={item.reminder}
                frequency_rate_int={item.frequency_rate_int}
                date={selectedDate}
                />
            </View>
            )}
            estimatedItemSize={80}
            />

  )
}

export default DailyHabitDisplay