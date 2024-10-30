import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { HabitTrackingEntry } from '@/types/types';


interface HeatCalendarProps {
    data: HabitTrackingEntry[];
    habitName: string,
    frequency: number,
    frequencyRate: string
}

const getColorForCount = (count: number) => {
    if (count === 0) return '#c9ced6';  // light grey
    if (count === 1) return '#3e4e88';  // dark blue
    if (count === 2) return '#7bc96f';  // light green
    if (count === 3) return '#239a3b';  // medium green
    return '#196127';                   // darkest green
};

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const HeatCalendar5x7: React.FC<HeatCalendarProps> = ({ data, habitName, frequency, frequencyRate }) => {
    const organizeDataIntoRows = (data: HabitTrackingEntry[]) => {
        // Sort data by date
        const sortedData = [...data].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Create a map of date strings to their data
        const dateMap = new Map(
            sortedData.map(item => [item.date, item])
        );

        // Get today
        const today = dayjs();
        
        // Find the most recent Sunday (if today is Sunday, use today)
        let endDate = today;
        while (endDate.day() !== 0) { // 0 is Sunday in dayjs
            endDate = endDate.subtract(1, 'day');
        }
        
        // Go back 4 more weeks to get to the start date (5 weeks total)
        let startDate = endDate.subtract(4, 'week');
        
        // Initialize rows array
        const rows = [];
        let currentDate = startDate;

        // Create 5 rows with 7 days each
        for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
            const row = [];
            
            // Fill each row with 7 days
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                if (currentDate.isAfter(today)) {
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
    
        // Only count dates within our 5-week window
        const startDate = dayjs().subtract(4, 'week').startOf('week');
        const validData = data.filter(entry => 
            dayjs(entry.date).isAfter(startDate) || dayjs(entry.date).isSame(startDate)
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

    return (
        <View style={styles.container}>
            <Text style={styles.habitName}>{habitName}</Text>
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
                    <Text style={styles.metric}>{metrics.totalTracked}</Text>
                    <Text style={styles.metricText}>Days Tracked</Text>
                </View>
                <View style={styles.metricContainer}>
                    <Text style={styles.metric}>{metrics.consistencyPercentage}% </Text>
                    <Text style={styles.metricText}>Consistency</Text>
                </View>
                <View style={styles.metricContainer}>
                    <Text style={styles.metric}>{metrics.longestStreak} Days</Text>
                    <Text style={styles.metricText}>Longest Streak</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    habitName: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    habitFrequency: {
        color: 'grey',
        fontWeight: '300',
        fontSize: 16,
        marginBottom: 15,
    },
    container: {
        padding: 8,
        backgroundColor: '#b4bac6',
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
        color: '#788599'
    }
});

export default HeatCalendar5x7;