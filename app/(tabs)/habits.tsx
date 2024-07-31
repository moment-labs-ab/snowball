import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useContext, useEffect, useState } from 'react'
import { useGlobalContext } from '@/context/Context'
import images from '../../constants/images';
import LoadingScreen from '@/components/LoadingScreen'
import DatePicker from '@/components/DatePicker'
import CustomButton from '@/components/CustomButtom'
import NewHabit from '@/modals/NewHabit'
import { getUserHabits } from '@/lib/supabase'
import { Habit } from '@/types/types'
import DailyHabitDisplay from '@/components/DailyHabitDisplay';

const Habits = () => {
  const { user, isLoading } = useGlobalContext();

  const getCurrentTime = () => {
    let time_of_day: string;
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    if (hours < 12){
      time_of_day = 'Morning';
    }else if (hours >= 12 && hours <=17){
      time_of_day = 'Afternoon';
    }else{
      time_of_day = 'Evening';
    }
    return time_of_day;
  };
  const time_of_day = getCurrentTime();

  const handleDateChange = (date: Date) => {
    console.log('Selected date:', date);
  };


  //MODAL LOGIC
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHabits = async () => {
      const habitsData = await getUserHabits(user.userId);
      setHabits(habitsData);
      setLoading(false);
    };

    fetchHabits();
  }, [user.userId]);


  if (loading) {
    return <Text>Loading...</Text>;
  }


  return (
    <SafeAreaView className="bg-background h-full">
            <View className="justify-between items-start flex-row mt-6 mb-10">
              <View>
                <Text className="text-xl font-bold text-secondary pl-3">
                  Good {time_of_day},
                </Text>
                <Text className="text-xl font-bold text-secondary pl-3">
                  {user.username}
                </Text>
              </View>

              <View>
                <Image
                  source={images.snowballlogo}
                  className="w-[80px] h-[80px]"
                  resizeMode="contain"
                />
              </View>
            </View>

            <View className="justify-between items-start flex-row mt-6 mb-10 px-3">
              <DatePicker onDateChange={handleDateChange}/>

              
              <TouchableOpacity 
                onPress={handleOpenModal}
                activeOpacity={0.7}
                className="bg-secondary rounded-full w-12 h-12 justify-center items-center"
              >
                  <Text className="text-white font-pbold text-lg">
                      +
                  </Text>
              </TouchableOpacity>
              </View>
              <View>
              <NewHabit visible={modalVisible} onClose={handleCloseModal}/>
              </View>

              <DailyHabitDisplay habits={habits}/>
              
    </SafeAreaView>
  )
}


export default Habits