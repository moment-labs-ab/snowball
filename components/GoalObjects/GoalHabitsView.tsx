import { View, Text, StyleSheet, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getHabitTrackingCount } from '@/lib/supabase_progress'
import { FlashList } from '@shopify/flash-list'
import ProgressRaceBar from './ProgressRaceBar'

type GoalHabitsViewProps = {
    habit_ids: { [key: string]: any };
    created_at: Date,
    expected_end_date: Date,
    color: string
}

interface Habit {
    id: string;
    name: string;
}

const GoalHabitsView = ({habit_ids, created_at, expected_end_date, color}: GoalHabitsViewProps) => {
    const [habitsTracking, setHabitsTracking] = useState<{ [key: string]: number }>({})
    const [isLoading, setIsLoading] = useState(true)

    const goalStartDate = new Date(created_at)
    const goalEndDate = new Date(expected_end_date)
    const today = new Date()

    function getDaysBetweenDates(startDate: Date, endDate: Date): number {
        const oneDayMs = 24 * 60 * 60 * 1000;
        const start = startDate.getTime();
        const end = endDate.getTime();
        return Math.round(Math.abs(end - start) / oneDayMs);
    }

    const daysBetween = getDaysBetweenDates(goalStartDate, today)
    const totalExpectedDays = getDaysBetweenDates(goalStartDate, goalEndDate)
    const totalDaysLeft = getDaysBetweenDates(today, goalEndDate)

    useEffect(() => {
        const fetchHabitTracking = async () => {
            setIsLoading(true)
            try {
                const trackingData = await Promise.all(
                    habit_ids.map(async (habit: Habit) => {
                        const count = await getHabitTrackingCount(habit.id, goalStartDate.toDateString(), goalEndDate.toDateString());
                        return { name: habit.name, count };
                    })
                );

                const trackingObject = trackingData.reduce((acc, { name, count }) => {
                    acc[name] = count;
                    return acc;
                }, {} as { [key: string]: number });

                setHabitsTracking(trackingObject);
            } catch (error) {
                console.error("Error fetching habit tracking data:", error);
            } finally {
                setIsLoading(false)
            }
        };

        fetchHabitTracking();

        
    }, [])

    const trackingData = Object.entries(habitsTracking)

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading habits...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.flashListContainer}>
            
              <Text style={styles.labelKey}>
              <Text style={{color:color}}>Tracked</Text>
              <Text style ={{color:'#bababa'}}> / </Text>
              <Text style ={{color:"#afd2fc"}}>Expected</Text>
              <Text style ={{color:'#bababa'}}> / </Text>
              <Text style ={{color:'#6f6e79'}}>Days Left </Text>
              </Text>

                <FlashList
                    data={trackingData}
                    keyExtractor={([habitName]) => habitName}
                    renderItem={({ item: [habitName, count] }) => (
                        <View style={styles.item}>
                            <Text style={styles.habitName}>{habitName}</Text>
                            <ProgressRaceBar 
                                actual={count} 
                                expectedNow={daysBetween} 
                                total={totalExpectedDays} 
                                totalDaysLeft={totalDaysLeft}
                                color={color}
                            />
                        </View>
                    )}
                    estimatedItemSize={100}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </View>
    )
}

export default GoalHabitsView;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 400, // Set a fixed height or use Dimensions.get('window').height * 0.8 for dynamic height
    },
    flashListContainer: {
        flex: 1, // This ensures the FlashList takes up all available space
        width: '100%',
        height: '100%',
    },
    item: {
        flexDirection: 'column',
        paddingHorizontal:10,
        width: '100%',
        flex: 1,
        marginBottom:5
    },
    habitName: {
        fontSize: 14,
        fontWeight: "500",
        color: 'black',
        textAlign:'center'
    },
    loadingText: {
        fontSize: 16,
        color: "gray",
        textAlign: 'center',
        padding: 16,
    },
    labelKey: {
      fontSize: 10,
      color: '#666',
      textAlign:'center',
      fontWeight:'600',
      marginBottom:4
    },
    listContent: {
      padding: 2,
      paddingHorizontal:2
    },
});