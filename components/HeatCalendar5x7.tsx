import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { HabitTrackingEntry } from '@/types/types';
import Emoji from 'react-native-emoji';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Feather from '@expo/vector-icons/Feather';
import CalendarButton from './CalendarButton';
import HabitYearView from './HabitYearView';
import EditProfile from './ProfileSettings/EditProfile';

interface HeatCalendarProps {
    data: HabitTrackingEntry[];
    habitName: string,
    frequency: number,
    frequencyRate: string,
    id: string
}

const getColorForCount = (count: number) => {
    if (count === 0) return '#a0a7b7';  // light grey
    if (count === 1) return '#3e4e88';  // dark blue
    if (count === 2) return '#7bc96f';  // light green
    if (count === 3) return '#239a3b';  // medium green
    return '#196127';                   // darkest green
};

const daysOfWeek = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];

const HeatCalendar5x7: React.FC<HeatCalendarProps> = ({ data, habitName, frequency, frequencyRate, id }) => {
    
    const organizeDataIntoRows = (data: HabitTrackingEntry[]) => {
        // Sort data by date
        const sortedData = [...data].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Create a map of date strings to their data
        const dateMap = new Map(
            sortedData.map(item => [item.date, item])
        );

        // Get today and calculate start date (35 days ago)
        const today = dayjs();
        const startDate = today.subtract(34, 'day');  // 34 days ago + today = 35 days
        
        // Calculate how many days we need to add at the start to align with Sunday
        const daysToAdd = startDate.day(); // 0 for Sunday, 1 for Monday, etc.
        const alignedStartDate = startDate.subtract(daysToAdd, 'day');
        
        // Initialize rows array
        const rows = [];
        let currentDate = alignedStartDate;

        // Calculate how many rows we need to show all dates
        const totalDays = 35 + daysToAdd;
        const numberOfRows = Math.ceil(totalDays / 7);

        // Create rows
        for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            const row = [];
            
            // Fill each row with 7 days
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const isBeforeStartDate = currentDate.isBefore(startDate);
                const isAfterToday = currentDate.isAfter(today);
                
                if (isBeforeStartDate || isAfterToday) {
                    row.push(null);
                } else {
                    const dateStr = currentDate.format('YYYY-MM-DD');
                    const dayData = dateMap.get(dateStr) || { date: dateStr, count: 0 };
                    row.push(dayData);
                }
                currentDate = currentDate.add(1, 'day');
            }
            
            rows.push(row);
        }

        return rows;
    };

    const rows = organizeDataIntoRows(data);

    function calculateMetrics(data: HabitTrackingEntry[]) {
        let totalTracked = 0;
        let longestStreak = 0;
        let currentStreak = 0;
    
        // Only count the last 35 days
        const startDate = dayjs().subtract(34, 'day').startOf('day');
        const validData = data.filter(entry => 
            (dayjs(entry.date).isAfter(startDate) || dayjs(entry.date).isSame(startDate)) &&
            dayjs(entry.date).isBefore(dayjs().endOf('day'))
        );
    
        validData.forEach((entry) => {
            if (entry.count > 0) {
                totalTracked++;
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });
    
        const totalDays = validData.length;
        const consistencyPercentage = totalDays > 0 ? (totalTracked / totalDays) * 100 : 0;
    
        return {
            totalTracked,
            consistencyPercentage: consistencyPercentage.toFixed(0),
            longestStreak
        };
    }

    const metrics = calculateMetrics(data);
    const forceTouch = Gesture.ForceTouch();

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
            <Text style={styles.habitName}>{habitName}</Text>
            <CalendarButton label={habitName + " Year In Review"} content={<HabitYearView id={id}/>}/>
            </View>
            <Text style={styles.habitFrequency}>Goal: {frequency}x {frequencyRate}</Text>

            <View style={styles.headerContainer}>
                <View style={styles.dateLabelSpacing} />
                <View style={styles.daysHeader}>
                    {daysOfWeek.map((day, index) => (
                        <Text key={`day-${index}`} style={styles.dayLabel}>
                            {day}
                        </Text>
                    ))}
                </View>
            </View>

            <View style={styles.gridContainer}>
                {rows.map((row, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.row}>
                        <Text style={styles.dateLabel}>
                            {row[0] ? dayjs(row[0].date).format('MM/DD') : ''}
                        </Text>

                        <View style={styles.boxesRow}>
                            {row.map((day, dayIndex) => (
                                <View
                                    key={`day-${rowIndex}-${dayIndex}`}
                                    style={[
                                        styles.dayBox,
                                        { backgroundColor: day ? getColorForCount(day.count) : '#b4bac6' }
                                    ]}
                                >
                                    {day && <Text style={styles.dayText}>{dayjs(day.date).format('DD')}</Text>}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
            
            <View style={styles.statsContainer}>
                <View style={styles.metricContainer}>
                    <Text style={styles.metric}>❄️{metrics.totalTracked}</Text>
                    <Text style={styles.metricText}> Days Tracked</Text>
                </View>
                <View style={styles.metricContainer}>
                    <Text style={styles.metric}> 🏔{metrics.consistencyPercentage}% </Text>
                    <Text style={styles.metricText}> Consistency</Text>
                </View>
                <View style={styles.metricContainer}>
                    <Text style={styles.metric}>🔥{metrics.longestStreak} Days</Text>
                    <Text style={styles.metricText}> Longest Streak</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topRow:{
        flexDirection:'row',
        alignContent:'flex-end',
        justifyContent:'space-between',
        alignItems:'center'
    },
    habitName: {
        fontSize: 25,
        fontWeight: 'bold',
        color:'#3e4e88'
    },
    habitFrequency: {
        color: 'black',
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 15,
    },
    container: {
        padding: 8,
        backgroundColor: '#d2d5dd',
        borderRadius: 8
    },
    headerContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dateLabelSpacing: {
        width: 34,
    },
    daysHeader: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
    },
    dayLabel: {
        width: 36,
        textAlign: 'center',
        fontWeight: 'bold',
        marginRight: 3,
    },
    gridContainer: {
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    dateLabel: {
        width: 32,
        textAlign: 'right',
        fontWeight: 'bold',
        fontSize: 8,
        paddingRight: 4,
        alignSelf: 'center',
    },
    boxesRow: {
        flexDirection: 'row',
        flex: 1,
    },
    dayBox: {
        width: 43.75,
        height: 43.75,
        marginRight: 3,
        backgroundColor: '#b4bac6',
        borderRadius: 4,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingStart: 2
    },
    dayText: {
        fontSize: 10,
        color: 'white'
    },
    statsContainer: {
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row'
    },
    metricContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20
    },
    metric: {
        fontWeight: 'bold',
        color: "#5a626f",
        fontSize: 24
    },
    metricText: {
        fontWeight: 'bold',
        color: '#788599',
        justifyContent:'center',
        alignContent:'center'
    }
});

export default HeatCalendar5x7;