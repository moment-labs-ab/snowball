import { View, Text, ScrollView, StyleSheet} from 'react-native'
import React, {useState, useEffect} from 'react'
import { Habit } from '@/types/types'
import { getUserArchivedHabits} from '@/lib/supabase_habits'
import { useGlobalContext } from '@/context/Context'
import { useHabitContext } from '@/context/HabitContext'

const SettingsHabits = () => {
  const { user, isLoading } = useGlobalContext();
  const {habits} = useHabitContext();
  const [settingHabits, setSettingHabits] = useState<Habit[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  
    const fetchArchivedHabits = async () => {
      const habitsData = await getUserArchivedHabits(user.userId);
      setArchivedHabits(habitsData);
      setLoading(false);
      };

  useEffect(()=>{

    if(habits){
      setSettingHabits(habits)
    }

    fetchArchivedHabits();

  }, [])

  

  const formatDate = (date: string | null): string => {
    if (!date) return '';
    
    // Add timezone offset to correct the date
    const newDate = new Date(date)
    const correctedDate = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000);
    
    return correctedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  return (
    <ScrollView>
    <View style={styles.container}>
    <View style={styles.section}>
    <Text style={styles.sectionTitle}>Active Habits</Text>
        <View style={{borderBottomWidth:1, borderBottomColor:'black'}}/>
        {habits.map(habit => (
          <View key={habit.id} style={styles.habitItem}>
            <Text style={styles.habitName}>{habit.emoji} {habit.name}</Text>
            <Text style={styles.habitDate}>
              Habit Started: {formatDate(habit.created_at)}
            </Text>
            
          </View>
        ))}
        {habits.length === 0 && (
          <Text style={styles.emptyMessage}>No active habits</Text>
        )}
    </View>

    <View style={styles.section}>
    <Text style={styles.sectionTitle}>Archived Habits</Text>
        <View style={{borderBottomWidth:1, borderBottomColor:'black'}}/>
        {archivedHabits.map(habit => (
          <View key={habit.id} style={styles.habitItem}>
            <Text style={styles.habitName}>{habit.emoji} {habit.name}</Text>
            <Text style={styles.habitDate}>
              Habit Archived: {formatDate(habit.archived_at)}
            </Text>
            
          </View>
        ))}
        {archivedHabits.length === 0 && (
          <Text style={styles.emptyMessage}>No archived habits</Text>
        )}
    </View>

    </View>
    </ScrollView>
  )
}

export default SettingsHabits;
const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
    marginBottom:40
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  habitItem: {
    backgroundColor: '#c2dcfc',
    padding: 12,
    borderRadius: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
  },
  habitDate: {
    fontSize: 14,
    color: '#535353',
  },
  emptyMessage: {
    color: '#666',
    fontStyle: 'italic',
  },
});
