import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getHabitTrackingCount } from '@/lib/supabase_progress';
import { FlashList } from '@shopify/flash-list';
import ProgressRaceBar from './ProgressRaceBar';


type GoalHabitsViewProps = {
    habit_ids: { [key: string]: any };
    created_at: Date;
    expected_end_date: Date;
    color: string;
};

interface Habit {
    id: string;
    name: string;
}

const GoalHabitsView = ({ habit_ids, created_at, expected_end_date, color }: GoalHabitsViewProps) => {
    const [habitsTracking, setHabitsTracking] = useState<{ [key: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);

    const goalStartDate = new Date(created_at);
    const goalEndDate = new Date(expected_end_date);
    const today = new Date();

    const getDaysBetweenDates = (startDate: Date, endDate: Date): number => {
        const oneDayMs = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs(endDate.getTime() - startDate.getTime()) / oneDayMs);
    };

    const daysBetween = getDaysBetweenDates(goalStartDate, today);
    const totalExpectedDays = getDaysBetweenDates(goalStartDate, goalEndDate);
    const totalDaysLeft = getDaysBetweenDates(today, goalEndDate);

    useEffect(() => {
        const fetchHabitTracking = async () => {
            setIsLoading(true);
            try {
                const trackingData = await Promise.all(
                    habit_ids.map(async (habit: Habit) => {
                        const count = await getHabitTrackingCount(
                            habit.id,
                            goalStartDate.toDateString(),
                            goalEndDate.toDateString()
                        );
                        return { name: habit.name, count };
                    })
                );

                const trackingObject = trackingData.reduce((acc, { name, count }) => {
                    acc[name] = count;
                    return acc;
                }, {} as { [key: string]: number });

                setHabitsTracking(trackingObject);
            } catch (error) {
                console.error('Error fetching habit tracking data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHabitTracking();
    }, [habit_ids.length, color]);

    const trackingData = Object.entries(habitsTracking);

    const ITEM_HEIGHT = 65; // Approximate height of one row
    const MIN_HEIGHT = 75; // Minimum height of container
    const MAX_ROWS = 2.6; // Max rows to display without scroll
    const calculatedHeight = Math.min(trackingData.length, MAX_ROWS) * ITEM_HEIGHT;
    const containerHeight = Math.max(calculatedHeight, MIN_HEIGHT);

    if (isLoading) {
        return (
            <View style={[styles.container, { height: containerHeight }]}>
                <Text style={styles.loadingText}>Loading habits...</Text>
            </View>
        );
    }

    return (
        <View>
        <View style={[styles.container, { height: containerHeight }]}>
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
                estimatedItemSize={ITEM_HEIGHT}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={true}
                indicatorStyle='black'
            />
            </View>
        
        </View>
    );
};


export default GoalHabitsView;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height:'5%',
        justifyContent:'center',
    },
    scrollView: {
        padding: 10,
    },
    flashListContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    item: {
        flexDirection: 'column',
        paddingHorizontal: 10,
        width: '100%',
        flex: 1,
        marginBottom: 5,
    },
    habitName: {
        fontSize: 14,
        fontWeight: '200',
        color: 'black',
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        padding: 16,
    },
    labelKey: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontWeight: '600',
    },
    listContent: {
        padding: 2,
        paddingHorizontal: 2,
    },
});
