import { View, Text, Dimensions, ScrollView} from 'react-native'
import React, {useEffect, useState} from 'react'
import { getUserGoals } from '@/lib/supabase_goals'
import { useGlobalContext } from '@/context/Context'
import { FlashList } from "@shopify/flash-list";
import { Goal } from '@/types/types';
import GoalObject from './GoalObject';
import { goalEmitter } from '@/events/eventEmitters';
import { listenToGoalsTable } from '@/lib/supabase_goals';

const AllGoalsView = () => {
  const { user, isLoading } = useGlobalContext();
  const [goals, setGoals] = useState<Goal[]>([])

  const fetchUserGoals = async ()=>{
    const data = await getUserGoals(user.userId)
    //console.log(data)
    setGoals(data)
  }

  
  useEffect(()=>{
    fetchUserGoals();

    const listener = goalEmitter.addListener('newGoal', () => {
      // Perform refresh logic
      //console.log("Event Emitter")
      fetchUserGoals();
    });

  },[goals.length])
  return (
    <ScrollView>
    <View style={{ height: Dimensions.get('window').height, width: '100%' }}>
      <FlashList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <GoalObject
            id={item.id}
            created_at={item.created_at}
            name={item.name}
            emoji={item.emoji}
            habit_ids={item.habit_ids}
            tags = {item.tags}
            description={item.description}
            expected_end_date={item.expected_end_date}
            milestones={item.milestones}
            />
        )}
        estimatedItemSize={100}
      />
    </View>
    </ScrollView>
  )
}

export default AllGoalsView