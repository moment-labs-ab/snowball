import { View, Text, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native'
import React, {useState, useEffect} from 'react'
import { useGlobalContext } from '@/context/Context'
import { HabitTrackingEntry } from '@/types/types'
import { getGridTrackingHistory, listenToTrackingHistory } from '@/lib/supabase_progress'
import CommitHistory from './CommitHistory'
import CommitHistoryGrid from './CommitHistoryGrid'

interface HabitYearViewProps{
    id:string
}

const HabitYearView = ({id}: HabitYearViewProps) => {
    const { isLoggedIn, setUser, user } = useGlobalContext()
    const [endDate, setEndDate] = useState<Date>(new Date())
    const [startDate, setStartDate] = useState<Date>(new Date())
    const [gridData, setGridData] = useState<HabitTrackingEntry[]>();


    const now = new Date()
    const today = new Date(now.toDateString())
    const oneYearAgo = getLastYear(endDate)
    

    function getLastYear(date: Date): Date {
        const lastYearDate = new Date(date);
        lastYearDate.setDate(lastYearDate.getDate() - 365);
        return lastYearDate;
      }
    const fetchHabitTrackingData = async(startDate:Date, endDate:Date)=>{
        const data = await getGridTrackingHistory(user.userId, id,startDate, endDate)
        console.log(data)
        if(data){
            setGridData(data)
        }
        
    }
    useEffect(()=>{
        fetchHabitTrackingData(oneYearAgo, today)

    }, [])

  return (
    <ScrollView>
    <View>
        {gridData ? (<CommitHistory data={gridData}/>): <ActivityIndicator size="large" color="#3e4e88" />}
      
    </View>
    </ScrollView>
  )
}

export default HabitYearView