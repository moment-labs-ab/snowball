import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Platform, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import CustomButton from '@/components/CustomButtom';
import FormField from '@/components/FormField';
import Modal from 'react-native-modal'
import NumberInput from '@/components/NumberInput';
import TimeIntervalPicker from '@/components/TimeIntervalPicker';
import { deleteHabit, getHabit, updateHabitIfChanged, updateTracking } from '@/lib/supabase_habits';
import { useGlobalContext } from '@/context/Context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NumberBox from '@/components/NumberBox';

interface EditHabitProps {
  visible: boolean;
  onClose: () => void;
  title: string,
  habit_id: string,
  selectedDate: Date
  trackingCount: number,
  onTrackingCountChange: (newTrackingCount: number) => void;
}

const EditHabit: React.FC<EditHabitProps> = ({ visible, onClose, title, habit_id, selectedDate, trackingCount, onTrackingCountChange}) => {
  const [frequency, setFrequency] = useState<number>(1);
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [habit, setHabit] = useState({
    name: 'Habit',
    frequency: 0,
    frequency_rate: 'Daily',
    reminder: false
  });
  const {user} = useGlobalContext();


  const [tracking, setTrackingCount] = useState<number>(trackingCount)
  useEffect(() => {
    if (visible) {
      setTrackingCount(trackingCount);
    }
  }, [visible, trackingCount]);

  useEffect(() => {
    console.log("USEEFFECT: EditHabit")
    const fetchHabit = async () => {
      try {
        setLoading(true);
        const habitData = await getHabit(user.userId, habit_id);
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
  }, [user.userId, habit_id]);





  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  const [isSubmitting, setisSubmitting] = useState(false)
  const submit = async () => {
    //console.log(tracking); // Ensure this logs the correct, updated number
  
    if (habit.name === "Habit" || habit.frequency === 0) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }
  
    setisSubmitting(true);
  
    try {
      // Update habit details (this is already fine)
      const result = await updateHabitIfChanged(
        habit_id,
        user.userId,
        habit.name,
        habit?.reminder,
        habit.frequency,
        habit.frequency_rate
      );
  
      if (result.success === false) {
        //console.log(result.message);
      } else if (result.data) {
        //console.log(result);
      }
  
      // Update tracking count if changed
      if (trackingCount !== tracking) {
        console.log("Calling updateTracking...")
        const result = await updateTracking(user.userId, habit_id, selectedDate, tracking)
        console.log(habit_id, tracking)
        console.log("Tracking Changed!")
        onTrackingCountChange(tracking);
      }
  
    } catch (error) {
      Alert.alert(String(error));
      setisSubmitting(false);
    }
  
    setisSubmitting(false);
    onClose(); // Close the modal after successful submission
  }

  const closeHabits = () =>{
    onClose()
  }

  const handleDelete = async (habit_id: string, user_id:string)=>{
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit and its history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Delete canceled'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const result = await deleteHabit(habit_id, user_id);
            if (result.success) {
              console.log('Habit deleted successfully');
              closeHabits()
              // Handle successful deletion, e.g., refresh the habit list
            } else {
              console.error('Error deleting habit:', result.message);
              // Handle deletion error, e.g., show a message to the user
            }
          },
          style: 'destructive', // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside of it
    );

  }

  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{margin:0,justifyContent: 'flex-end', flex: 1 }}
    >
      <SafeAreaView style={{flex: 1,backgroundColor: '#E6F0FA',borderTopLeftRadius: 20,borderTopRightRadius: 20, marginTop: 75}}>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#E6F0FA', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <View style={{alignItems:'center', alignContent:'flex-start'}}>
          <Ionicons name="chevron-down-outline" size={20} color="black"/>
        </View>
        <View style={{flexDirection: 'row',alignItems: 'center', justifyContent:'space-between',paddingHorizontal:10, marginBottom:40, marginTop:20}}>
          <Text style={{ alignItems:'flex-start',fontSize: 24, fontWeight: 'bold'}}>
            {habit.name}
          </Text>
          <TouchableOpacity onPress={()=>{handleDelete(habit_id,user.userId)}}
          style={{ alignSelf: 'flex-end', justifyContent: 'center',alignItems: 'center'}}>
            <Ionicons name="trash-outline" size={28} color="red" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

        <NumberBox
        title='Tracker'
        placeholder={trackingCount}
        handleChangeNumber={(e) => setTrackingCount(e)}
        />


        <FormField
          title="I want to"
          placeholder={habit.name}
          handleChangeText={(e) => setHabit({ ...habit, name: e })}
          otherStyles="px-2"
        />
        <NumberInput
          title='Frequency'
          placeholder={String(habit.frequency)}
          handleChangeText={(e) => setHabit({ ...habit, frequency: e })}
          otherStyles="px-2 mt-3"
        />
        <TimeIntervalPicker
          onSave={(e) => setHabit({ ...habit, frequency_rate: e })}
          otherStyles='px-2 mt-3'
          initialValue={habit.frequency_rate}
        />

        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', paddingLeft: 4 }}>
          
          <Text className="text-base text-black-100 font-pmedium">
            Add a Reminder </Text>
          <Switch
            value={habit.reminder}
            onValueChange={(value) => setHabit({ ...habit, reminder: value })}
            trackColor={{ false: 'gray', true: '#8BBDFA' }}
            className='pl-2'
          />
        </View>

        <View style={{ marginTop: 50, flexDirection: 'row',justifyContent: 'center',alignItems: 'center', paddingHorizontal:50 }}>
          <Text style={{ color: 'gray', fontSize: 18, fontWeight: '500' }}>I want to </Text>
          <Text style={{ color: '#3e4e88', fontSize: 18, fontWeight: '700' }}>{habit.name} </Text>
          <Text style={{ color: '#3e4e88', fontSize: 18, fontWeight: '700', marginRight: 3 }}>
            {habit.frequency}
          </Text>
          <Text style={{ color: 'gray', fontSize: 18, fontWeight: '500', marginRight: 3 }}>
            {habit.frequency === 1 ? 'time' : 'times'}
          </Text>
          <Text style={{ color: '#3e4e88', fontSize: 18, fontWeight: '700' }}>{habit.frequency_rate}</Text>
        </View>

        <CustomButton 
          title = 'Update'
          handlePress = {submit}
          containerStyles = "mt-7 px-2 bg-secondary"
          isLoading = {isSubmitting}
          otherMethods={onClose}
        />

      </View>
      </SafeAreaView>
    </Modal>
  );
}

export default EditHabit;
