import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export interface HabitTrackingEntry {
  date: string;
  count: number;
}

interface CommitHistoryProps {
  data: HabitTrackingEntry[];
}

const CommitHistory: React.FC<CommitHistoryProps> = ({ data }) => {
  const earliestDate = data.reduce((earliest, entry) => 
  entry.date < earliest ? entry.date : earliest, data[0].date);
  const earliestDateFomatted = new Date(earliestDate).toDateString()
  
  const latestDate = data.reduce((latest, entry) => 
  entry.date > latest ? entry.date : latest, data[0].date);
  const latestDateFomatted = new Date(latestDate).toDateString()

  const groupedData = useMemo(() => {
    const grouped: { [key: string]: HabitTrackingEntry[] } = {};
    data.forEach(entry => {
      const monthYear = entry.date.substring(0, 7); // YYYY-MM
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(entry);
    });
    return grouped;
  }, [data]);

  const sortedMonths = useMemo(() => {
    return Object.keys(groupedData).sort((a, b) => b.localeCompare(a));
  }, [groupedData]);

  const renderMonth = (monthYear: string) => {
    const monthData = groupedData[monthYear];
    const [year, month] = monthYear.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });

    const daysOfWeek = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
    const firstDayOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1).getDay();
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < 42; i++) {
      const dayOfMonth = i - firstDayOfMonth + 1;
      if (dayOfMonth > 0 && dayOfMonth <= daysInMonth) {
        const dateString = `${year}-${month.padStart(2, '0')}-${dayOfMonth.toString().padStart(2, '0')}`;
        const entry = monthData.find(e => e.date === dateString);
        calendarDays.push({ day: dayOfMonth, entry });
      } else {
        calendarDays.push(null);
      }
    }

    const weeks = [];
    for (let i = 0; i < 6; i++) {
      weeks.push(calendarDays.slice(i * 7, (i + 1) * 7));
    }

    return (
      <View key={monthYear} style={styles.monthContainer}>
        <Text style={styles.monthLabel}>{`${monthName} ${year}`}</Text>
        <View style={styles.gridContainer}>
          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day, index) => (
              <Text key={index} style={styles.dayOfWeekLabel}>{day}</Text>
            ))}
          </View>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekContainer}>
              {week.map((day, dayIndex) => (
                <View key={dayIndex} style={styles.dayContainer}>
                  {day && (
                    <>
                      <View
                        style={[
                          styles.daySquare,
                          { backgroundColor: day.entry && day.entry.count > 0 ? '#8BBDFA' : '#ebedf0' }
                        ]}
                      />
                      <Text style={styles.dayLabel}>{day.day}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
      
    );
  };

  return (
    <View> 
    <ScrollView style={styles.container}>
      {sortedMonths.map(renderMonth)}
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthContainer: {
    marginBottom: 5,
    paddingHorizontal: 10,
    alignItems:'center'
  },
  monthLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 20,
  },
  gridContainer: {
    alignItems: 'flex-start',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  dayOfWeekLabel: {
    width: 50,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight:'500'
  },
  weekContainer: {
    flexDirection: 'row',
  },
  dayContainer: {
    width: 50,
    height: 50,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  daySquare: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 45,
    height: 45,
    borderRadius:4
  },
  dayLabel: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
    marginBottom: 7,
  },
});

export default CommitHistory;