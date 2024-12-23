import { View, Text, Dimensions, ScrollView} from 'react-native'
import React, {useEffect, useState} from 'react'
import { getUserGoals } from '@/lib/supabase_goals'
import { useGlobalContext } from '@/context/Context'
import { FlashList } from "@shopify/flash-list";
import { Goal } from '@/types/types';
import GoalObject from './GoalObject';

const AllGoalsView = () => {
  const { user, isLoading } = useGlobalContext();
  const [goals, setGoals] = useState<Goal[]>()

  const fetchUserHabits = async ()=>{
    const data = await getUserGoals(user.userId)
    //console.log(data)
    setGoals(data)
  }

  
  useEffect(()=>{
    fetchUserHabits()

  },[])
  return (
    <ScrollView>
    <View style={{ height: Dimensions.get('window').height, width: '100%' }}>
      <FlashList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <GoalObject
            id={item.id}
            name={item.name}
            emoji={item.emoji}
            habit_ids={item.habit_ids}
            tags = {item.tags}/>
        )}
        estimatedItemSize={100}
      />
    </View>
    </ScrollView>
  )
}

export default AllGoalsView