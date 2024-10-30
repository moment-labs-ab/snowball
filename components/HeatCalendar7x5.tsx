import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { HabitTrackingEntry } from '@/types/types';

interface HeatCalendarProps {
  data: HabitTrackingEntry[];
  habitName: string
}

const getColorForCount = (count: number) => {
  if (count === 0) return '#c9ced6';  // light grey
  if (count === 1) return '#3e4e88';  // dark blue
  if (count === 2) return '#7bc96f';  // light green
  if (count === 3) return '#239a3b';  // medium green
  return '#196127';                   // darkest green
};

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const HeatCalendar7x5: React.FC<HeatCalendarProps> = ({ data, habitName }) => {
  const organizeDataByDayOfWeek = (data: HabitTrackingEntry[]) => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Create a map of date strings to their data
    const dateMap = new Map(
      sortedData.map(item => [item.date, item])
    );

    // Get today and calculate dates
    const today = dayjs();
    const todayDayOfWeek = today.day(); // 0-6, where 0 is Sunday
    
    // Calculate the start of the current week (Sunday)
    const startOfCurrentWeek = today.subtract(todayDayOfWeek, 'day');
    
    // Start 4 weeks before the start of the current week
    let currentDate = startOfCurrentWeek.subtract(28, 'day');

    // Initialize columns array
    const columns = [];

    // Create 5 columns (weeks)
    for (let weekIndex = 0; weekIndex < 5; weekIndex++) {
      const week = [];
      
      // Fill each week with 7 days
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        // If the current date is after today, add a null entry
        if (currentDate.isAfter(today)) {
          week.push(null);
        } else {
          const dateStr = currentDate.format('YYYY-MM-DD');
          const dayData = dateMap.get(dateStr) || { date: dateStr, count: 0 };
          week.push(dayData);
        }
        currentDate = currentDate.add(1, 'day');
      }
      
      columns.push(week);
    }

    return columns;
  };

  const columns = organizeDataByDayOfWeek(data);

  return (
    <View style={styles.container}>
      {/* Week date labels at top */}
      <Text style={styles.habitName}>{habitName}</Text>
      <View style={styles.weekLabelsContainer}>
        <View style={styles.dayLabelSpacing} />
        {columns.map((column, index) => (
          <Text key={`week-${index}`} style={styles.weekLabel}>
            {column[0] ? dayjs(column[0].date).format('MM/DD') : ''}
          </Text>
        ))}
      </View>

      {/* Main grid */}
      <View style={styles.gridContainer}>
        {/* Day labels on left side */}
        <View style={styles.dayLabelsColumn}>
          {daysOfWeek.map((day, index) => (
            <View key={`day-${index}`} style={styles.dayLabelContainer}>
              <Text style={styles.dayLabel}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Heat map grid */}
        <View style={styles.columnsContainer}>
          {columns.map((column, columnIndex) => (
            <View key={`week-${columnIndex}`} style={styles.column}>
              {column.map((day, dayIndex) => (
                <View
                  key={`day-${columnIndex}-${dayIndex}`}
                  style={[
                    styles.dayBox,
                    { backgroundColor: day ? getColorForCount(day.count) : '#b4bac6' }
                  ]}
                >
                  {day && <Text style={{ fontSize: 8, color: 'white' }}>{dayjs(day.date).format('DD')}</Text>}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#b4bac6',
    borderRadius: 8
  },
  weekLabelsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabelSpacing: {
    width: 32,
  },
  weekLabel: {
    width: 60,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10,
    marginRight: 2,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  dayLabelsColumn: {
    width: 32,
    marginRight: 0,
  },
  dayLabelContainer: {
    height: 50,
    marginBottom: 4,
    justifyContent: 'center',
  },
  dayLabel: {
    textAlign: 'right',
    fontWeight: 'bold',
    paddingRight: 4,
  },
  columnsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  column: {
    width: 39,
    marginRight: 25,
  },
  dayBox: {
    width: 50,
    height: 50,
    marginBottom: 4,
    backgroundColor: '#b4bac6',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
});

export default HeatCalendar7x5;