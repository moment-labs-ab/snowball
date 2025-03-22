import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert} from 'react-native'
import React, {useState, useEffect} from 'react'
import { Habit } from '@/types/types'
import { getUserArchivedHabits, deleteHabit} from '@/lib/supabase_habits'
import { useGlobalContext } from '@/context/Context'
import { useHabitContext } from '@/context/HabitContext'
import Ionicons from "react-native-vector-icons/Ionicons";
import { Toast } from 'react-native-toast-message/lib/src/Toast'

type SettingsHabitsProps = {
  toggleContent: ()=>void
}

const SettingsHabits = ({toggleContent}: SettingsHabitsProps) => {
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

  const handleDelete = async (habit_id: string, user_id: string) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit and its history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          //onPress: () => console.log('Delete canceled'),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const result = await deleteHabit(habit_id, user_id);
            if (result.success) {
              showUpdateToast("deleted")
              toggleContent()
            } else {
              console.error("Error deleting habit:", result.message);
              // Handle deletion error, e.g., show a message to the user
            }
          },
          style: "destructive", // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside of it
    );
  };

  const showUpdateToast = (action: string) => {
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: `Habit ${action}.`,
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
          console.log("Premium Requested!");
        }, // Navigate to your premium page
      },
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
          <View
          key={habit.id}
          style={styles.habitItem}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={styles.habitName}>
                {habit.emoji} {habit.name}
              </Text>
              <Text style={styles.habitDate}>
                Accomplished: {formatDate(habit.archived_at)}
              </Text>
            </View>
            <View style={{ justifyContent: "center" }}>
              <TouchableOpacity
                onPress={() => {
                  handleDelete(habit.id, user.userId);
                }}
                style={styles.deleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="black"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            </View>
          </View>
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
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});
