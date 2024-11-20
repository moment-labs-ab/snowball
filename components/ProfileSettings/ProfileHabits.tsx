import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { FlashList } from "@shopify/flash-list";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, PanGestureHandler } from 'react-native-gesture-handler';
import { supabase } from '@/lib/supabase';
import { Habit } from '@/types/types';
import { getUserHabits, getHabitCount } from '@/lib/supabase_habits';
import { useGlobalContext } from '@/context/Context';
import DraggableHabitItem from './DraggableHabitItem';
import { updateHabitOrder } from '@/lib/supabase_profile';
import MovableHabit from './MovableHabit';
import DraggableList from './DraggableList';



const { width } = Dimensions.get('window');
const batchUpdateHabitOrders = async (updates: { id: string; order: number }[]) => {
    for (const update of updates) {
      await updateHabitOrder(update.id, update.order);
    }
  };

const ProfileHabits = () => {
    const { user } = useGlobalContext();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [moving, setMoving] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [habitCount, setHabitCount] = useState<number | null>(0);
  
    useEffect(() => {
      const fetchHabits = async () => {
        const habitsData = await getUserHabits(user.userId);
        setHabits(habitsData);
        setLoading(false);
      };
  
      const fetchHabitCount = async () => {
        const count = await getHabitCount(user.userId);
        setHabitCount(count);
      };
  
      fetchHabits();
      fetchHabitCount();
  
      // ... rest of your existing useEffect code ...
    }, [user.userId]);
  
  
    const saveOrder = async () => {
      const updates = habits.map((habit, index) => ({
        id: habit.id,
        order: index + 1
      }));
      await batchUpdateHabitOrders(updates);
    };
  
    return (
      <View style={styles.container}>
        
        <DraggableList habits={habits}/>
        {/**
        <FlashList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View>
            <MovableHabit id={item.id} order={item.order} name={item.name}/>
            </View>
          )}
          estimatedItemSize={80}
        />
         */}
        
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    habitItem: {
      backgroundColor: 'white',
      padding: 16,
      marginVertical: 4,
      marginHorizontal: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      height: 80,
    },
    habitContent: {
      flex: 1,
    },
    habitName: {
      fontSize: 16,
      fontWeight: '500',
    },
    orderText: {
      fontSize: 12,
      color: '#666',
    },
    dragHandle: {
      padding: 8,
      justifyContent: 'space-between',
      height: 24,
    },
    dragLine: {
      width: 20,
      height: 2,
      backgroundColor: '#CCCCCC',
      marginVertical: 2,
    },
    saveButton: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      backgroundColor: '#007AFF',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    saveButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
    },
  });
  
  export default ProfileHabits;