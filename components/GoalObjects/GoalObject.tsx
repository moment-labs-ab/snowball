import { View, Text, Dimensions} from 'react-native'
import React, {useEffect, useState} from 'react'
import { getUserGoals } from '@/lib/supabase_goals'
import { useGlobalContext } from '@/context/Context'
import { FlashList } from "@shopify/flash-list";
import { Goal } from '@/types/types';

type GoalObjectProps = {
  id: string,
  name: string,
  emoji: string,
  habit_ids: { [key: string]: any },
  tags: Object
}
type HabitIdItem = {
  id: string,
  value: any
}

const GoalObject = ({id,
  name,
  emoji,
  habit_ids,
  tags}: GoalObjectProps) => {
  const { user, isLoading } = useGlobalContext();
  const [goals, setGoals] = useState<Goal[]>()
  const [habitIdsList, setHabitIdsList] = useState<HabitIdItem[]>([])

  const renderHabitItem = ({ item }: { item: HabitIdItem }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
      <Text>Habit {item.id}</Text>
      <Text>Value: {JSON.stringify(item.value.name)}</Text>
    </View>
  );

  useEffect(() => {
    // Convert habit_ids object to an array of key-value pairs
    const habitIdsArray = Object.entries(habit_ids).map(([id, value]) => ({ id, value }))
    setHabitIdsList(habitIdsArray)
  }, [habit_ids])
  return (
    <View>
      <Text>{name}</Text>
      <Text>{emoji}</Text>
      <FlashList
        data={habitIdsList}
        renderItem={renderHabitItem}
        estimatedItemSize={50}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

export default GoalObject