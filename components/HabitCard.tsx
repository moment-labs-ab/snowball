import { View, Text, TouchableOpacity, Animated, PanResponder} from 'react-native'
import React, {useRef, useState, useEffect} from 'react'
import { addTracking, getTrackingCount, removeTracking, listenToHabitTrackingTable } from '@/lib/supabase'
import { useGlobalContext } from '@/context/Context'
import Entypo from '@expo/vector-icons/Entypo';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import EditHabit from '@/modals/EditHabit';
import { HabitTracking } from '@/types/types';

type habitCardProps = {
    id: string,
    created_at:string,
    name:string,
    frequency: number,
    frequency_rate: string,
    reminder: boolean,
    frequency_rate_int: number
    date: Date
}


const HabitCard = ({
    id,
    created_at,
    name,
    frequency,
    frequency_rate,
    reminder,
    frequency_rate_int,
    date}: habitCardProps) => {
    const { user, isLoading } = useGlobalContext();
    const [trackingCount, setTrackingCount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true);
    const [trackingColor, setTrackingColor] = useState<string>('#6bcd32')

    const animatedValue = useRef(new Animated.Value(0)).current;
        // PanResponder to detect swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return gestureState.dx !== 0 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
        })
    ).current;


    useEffect(() => {
        console.log("USEEFFECT: HabitCard")
        const fetchTrackingCount = async () => {
            const count = await getTrackingCount(id, user.userId, date);
            setTrackingCount(count);
            //console.log("fetchTrackingCount", trackingCount)
            setLoading(false);
    
            const initialProgress = count / frequency;
            Animated.timing(animatedValue, {
                toValue: Math.min(initialProgress),
                duration: 250,
                useNativeDriver: false,
            }).start();
        };
        fetchTrackingCount();
        const unsubscribe = listenToHabitTrackingTable((payload) => {
            let newCount;
            console.log("Pre Payload, habit_id:", payload.new?.habit_id , id)
        
            // Check if the update is for the current habit card
            if (payload.new?.habit_id === id || payload.old?.habit_id === id) {
                console.log("Entering Payload, habit_id:", payload.new?.habit_id , id)
                switch (payload.eventType) {
                    case 'INSERT':
                    case 'UPDATE':
                        if (payload.new) {
                            //console.log("payload.new")
                            newCount = Number(payload.new.tracking_count);
                            
                        }
                        break;
                    case 'DELETE':
                        if (payload.old) {
                            //console.log("payload.new")
                            newCount = Number(payload.old.tracking_count);
                        }
                        break;
                }
            }
                if (newCount !== trackingCount && newCount !== undefined) {
                    setTrackingCount(newCount);
                    console.log("Listener",trackingCount)
                    
                    // Trigger the progress bar animation for the specific habit
                    Animated.timing(animatedValue, {
                        toValue: Math.min(newCount / frequency),
                        duration: 250,
                        useNativeDriver: false,
                    }).start();
            }
          });
      
          // Cleanup subscription on unmount
          return () => {
            unsubscribe();
          };
        

    
    }, [id, user.userId, date, frequency_rate_int, trackingCount]);

    
    const handlingPress = async (id: string, frequency: number, habitTrackingAmount: number) => {
        const trackingData = await addTracking(user.userId, id, date);
        //const newTrackingCount = trackingData/frequency;
        setTrackingCount(trackingData);
        console.log("HandlingPress", trackingCount)
    
        
    };

    const handleTrackingCountChange = (newTrackingCount: number) => {
        if(newTrackingCount !== trackingCount){
            setTrackingCount(newTrackingCount);
        }
        
      };


    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [trackingColor, trackingColor],
    });

    const width = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    //Edit Habits MODAL LOGIC
    const [modalVisible, setModalVisible] = useState(false);

    const handleOpenModal = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };


  return (
    <TouchableOpacity
    {...panResponder.panHandlers}
    onPress={() => { handlingPress(id, frequency, trackingCount) }}
    activeOpacity={0.7}
    style={{ 
        backgroundColor: '#edf5fe',
        borderRadius: 15,
        minHeight: 62,
        justifyContent: 'center', // Center content vertically
        borderWidth: 1,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        flex: 1,
    }}
>
    <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width,
        backgroundColor,
    }} />
    <View style={{ 
        flexDirection: 'row', // Row layout for text and button
        alignItems: 'center', // Center items vertically within row
        justifyContent: 'space-between', // Space out text and button
        paddingHorizontal: 5, // Padding for left and right
        flex: 1,
    }}>
        <View style={{ flex: 1, paddingLeft: 5}}>
            <Text style={{ 
                color: '#3e4e88',
                fontWeight: '600',
                fontSize: 18,
                zIndex: 1,
            }}>
                {name}
            </Text>
            <Text style={{ 
                color: 'grey',
                fontWeight: '300',
                fontSize: 14,
                zIndex: 1,
            }}>
                {frequency}x {frequency_rate}
            </Text>
        </View>
        <TouchableOpacity onPress={() => {handleOpenModal()}} style={{ paddingRight: 5 }}>
            <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
        <View>
            <EditHabit visible={modalVisible}
            onClose={handleCloseModal}
            title={"Edit "}
            habit_id={id}
            selectedDate={date}
            trackingCount={trackingCount}
            onTrackingCountChange={handleTrackingCountChange} />
        </View>
    </View>
</TouchableOpacity>

  )
}

export default HabitCard