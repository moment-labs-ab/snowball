import { View, Text, Animated } from 'react-native'
import React, { useState, useEffect } from 'react'
import { getHabit } from '@/lib/supabase_habits'
import { useGlobalContext } from '@/context/Context'

type habitProgressBarProps = {
  habitId: string,
  progress: number,
  baseline: number
}

const HabitProgressBar = ({habitId, progress, baseline}: habitProgressBarProps) => {
  const { user, isLoading } = useGlobalContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [habitProgress, setHabitProgress] = useState("")
  const [habit, setHabit] = useState({
    name: 'Habit',
    frequency: 0,
    frequency_rate: 'Daily',
    reminder: false
  });
  const progressPercentage = (progress/baseline).toFixed(4).toString()
  setHabitProgress(progressPercentage)
  useEffect(() => {
    //console.log("USEEFFECT: EditHabit")
    const fetchHabit = async () => {
      try {
        setLoading(true);
        const habitData = await getHabit(user.userId, habitId);
        if (habitData) {
          setHabit(habitData);
        } else {
          setError('Habit not found');
        }
      } catch (err) {
        setError('An error occurred while fetching the habit');
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [user.userId, habitId]);


  return (
    <View className='px-5'>
    <View style={{
      flexDirection: 'row',
      alignItems:'center'
    }}>
      <Text style={{ 
                color: '#3e4e88',
                fontWeight: '600',
                fontSize: 18,
                zIndex: 1,
            }}>{habit.name} </Text>
      <Text style={{ 
                color: "#8BBDFA",
                fontWeight: '600',
                fontSize: 14,
                zIndex: 1,
            }}>{habit.frequency}x {habit.frequency_rate}</Text>
    </View>
    <View style={{backgroundColor: '#edf5fe',
        borderRadius: 12,
        minHeight: 22,
        justifyContent: 'center', // Center content vertically
        borderWidth: 1,
        marginHorizontal: 3,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        flex: 1,}}>


    </View>
    </View>
  )
}

export default HabitProgressBar