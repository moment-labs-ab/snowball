import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getHabitTrackingCount } from '@/lib/supabase_progress'
import { FlashList } from '@shopify/flash-list'
import { ScrollView } from 'react-native-gesture-handler'

type GoalHabitsViewProps ={
    habit_ids: { [key: string]: any };
    created_at: Date,
    expected_end_date: Date

}
interface Habit {
    id: string;
    name: string;
  }



const GoalHabitsView = ({habit_ids, created_at, expected_end_date}:GoalHabitsViewProps) => {
    const [habitsTracking, setHabitsTracking] = useState<{ [key: string]: Number }>({})

    const startDate = new Date(created_at)
    const endDate = new Date(expected_end_date)
    const today = new Date()

    function getDaysBetweenDates(startDate: Date, endDate: Date): number {
        const oneDayMs = 24 * 60 * 60 * 1000; // Milliseconds in one day
        const start = startDate.getTime(); // Get timestamp for startDate
        const end = endDate.getTime(); // Get timestamp for endDate
    
        return Math.round(Math.abs(end - start) / oneDayMs);
    }
    const daysBetween = getDaysBetweenDates(startDate, today)


      useEffect(()=>{
        const fetchHabitTracking = async () => {
            try {
              const trackingData = await Promise.all(
                habit_ids.map(async (habit:Habit) => {
                  const count = await getHabitTrackingCount(habit.id, startDate.toDateString(), endDate.toDateString());
                  return { name: habit.name, count };
                })
              );
      
              // Convert to the desired state structure
              const trackingObject = trackingData.reduce((acc, { name, count }) => {
                acc[name] = count;
                return acc;
              }, {} as { [key: string]: number });
      
              setHabitsTracking(trackingObject);
            } catch (error) {
              console.error("Error fetching habit tracking data:", error);
            }
          };
      
          fetchHabitTracking();
      }, [])

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Habits</Text>
    
      <FlashList
        data={Object.entries(habitsTracking)}
        keyExtractor={([habitName]) => habitName}
        renderItem={({ item: [habitName, count] }) => (
          <View style={styles.item}>
            <Text style={styles.habitName}>{habitName}</Text>
            <Text style={styles.count}> {count.toString()} times tracked out of {daysBetween.toString()}</Text>
          </View>
        )}
        estimatedItemSize={80}
      />
    
  </View>
  )
}

export default GoalHabitsView;

const styles = StyleSheet.create({
    container: {
        height:"50%",
        width:'100%',
      padding: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 16,
    },
    loadingText: {
      fontSize: 16,
      color: "gray",
    },
    item: {
      marginBottom: 8,
      flexDirection: "row",
      
    },
    habitName: {
      fontSize: 16,
      fontWeight: "500",
      color:'black'
    },
    count: {
      fontSize: 16,
      color: "gray",
    },
  });