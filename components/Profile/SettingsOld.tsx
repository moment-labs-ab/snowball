import { View, Text, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomButton from '@/components/CustomButtom';
import { signOut } from '@/lib/supabase_user';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/Context';
import { getUserLoginCount } from '@/lib/supabase_profile';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ProfileSettings from '@/components/ProfileSettings';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LifetimeHabitStats } from '@/types/types';
import { getLifetimeHabitStats } from '@/lib/supabase_profile';
import ProfileButton from '@/components/ProfileButton';
import EditProfile from '@/components/ProfileSettings/EditProfile';
import ProfileStats from '@/components/ProfileSettings/ProfileStats';
import ProfileHabits from '@/components/ProfileSettings/ProfileHabits';
import Feedback from '@/components/Profile/SettingsFeedback';

const Settings = () => {
  const { setIsLoggedIn, setUser, isLoggedIn, user } = useGlobalContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [userLoginCount, setUserLoginCount] = useState(0);
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeHabitStats>();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Refs for tooltip positioning
  const completionRateRef = useRef(null);
  const streakRef = useRef(null);
  const consistentHabitRef = useRef(null);
  const daysTrackedRef = useRef(null);
  const joinDateRef = useRef(null);
  const loginCountRef = useRef(null);

  const tooltipData = {
    completionRate: {
      title: "Completion Rate",
      value: `${lifetimeStats?.completionRate}%`,
      description: "The percentage of habits you've successfully completed out of all tracked habits.",
      calculation: "Completed Habits ÷ Total Habits Tracked × 100"
    },
    streak: {
      title: "Longest Streak",
      value: `${lifetimeStats?.longestStreak} ${lifetimeStats?.longestStreak === 1 ? 'Day' : 'Days'}`,
      description: "Your longest consecutive period of completing at least one habit daily.",
    },
    consistentHabit: {
      title: "Most Consistent Habit",
      value: lifetimeStats?.mostConsistentHabit,
      description: "The habit you've maintained most regularly over time.",
    },
    daysTracked: {
      title: "Total Days Tracked",
      value: lifetimeStats?.totalDaysTracked,
      description: "The total number of days you've logged into the app and tracked your habits.",
    },
    joinDate: {
      title: "Join Date",
      value: lifetimeStats?.joinDate?.toLocaleDateString(),
      description: "The date you started your habit tracking journey with us.",
    },
    loginCount: {
      title: "Account Logins",
      value: userLoginCount,
      description: "Total number of times you've accessed your account.",
    },
  };

  // Rest of the fetch functions remain the same...
  const fetchLoginCounts = async(user_id: string) => {
    const data = await getUserLoginCount(user_id);
    if(data) {
      setUserLoginCount(data);
    }
    return data;
  };

  const fetchLifetimeStats = async (user_id:string) => {
    const data = await getLifetimeHabitStats(user_id);
    if(data) {
      setLifetimeStats(data);
    } else {
      console.log("Error fetching lifetime stats");
    }
  };

  useEffect(() => {
    if(user) {
      fetchLoginCounts(user.userId);
      fetchLifetimeStats(user.userId);
    }
  }, [userLoginCount, lifetimeStats?.completionRate]);

  // Functions for handling modals and tooltips
  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);
  const showTooltip = (tooltipId: string) => setActiveTooltip(tooltipId);
  const hideTooltip = () => setActiveTooltip(null);

  // Rest of the logout function remains the same...
  const logout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Sign Out canceled'),
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              console.log('User Signed out successfully');
              setIsLoggedIn(false);
              setUser({
                email: '',
                username: '',
                userId: '',
                premiumUser:false
              });
              router.replace('/sign-in');
            } else {
              console.error('Error signing user out:', result.message);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const MetricItem = ({ 
    icon, 
    text, 
    tooltipKey, 
    reference 
  }: { 
    icon: JSX.Element, 
    text: string, 
    tooltipKey: string, 
    reference: React.RefObject<any> 
  }) => (
    <View style={styles.singleMetricsContainer}>
      <TouchableOpacity 
        style={styles.metricCircle}
        ref={reference}
        onPress={() => showTooltip(tooltipKey)}
      >
        {icon}
      </TouchableOpacity>
      <Text>{text}</Text>
      
    </View>
  );

  

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{backgroundColor:'#edf5fe', height:'100%'}}>
        <View className='flex-1 align-center pl-2 pr-2'>
          <View className="flex-row justify-between items-center mt-6">
            <Text className="text-xl font-bold text-secondary pl-2">
              Settings
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-l font-bold text-primary pl-2">& More</Text>
          </View>
          <View
            style={{
              height: 2,
              width: '98%',
              backgroundColor: '#3e4e88',
              alignSelf: 'center',
              marginTop: 4,
            }}
          />
          <ScrollView>
            <View className='px-3 mt-3'>
            <ProfileButton 
              label='Profile' 
              action={() => { console.log("Profile Pressed") }}
              content={<EditProfile/>} 
            />
            <ProfileButton 
              label='Habits' 
              action={() => { console.log("Habits Pressed") }}
              content={<ProfileHabits/>}
            />
            <ProfileButton 
              label='Terms & Conditions' 
              action={() => { console.log("Terms Pressed") }} 
            />
            <ProfileButton 
              label='Privacy Policy' 
              action={() => { console.log("Privacy Policy Pressed") }} 
            />
            <ProfileButton 
              label='Feedback' 
              action={() => { console.log("Feedback Pressed") }} 
              content={<Feedback/>}
            />

            <ProfileButton 
              label='Profile Stats' 
              action={() => { console.log("Donate Pressed") }}
              content={<ProfileStats/>}
            />
              
              <CustomButton
                title="Sign Out"
                handlePress={logout}
                containerStyles="mt-8 px-2 bg-secondary"
                otherMethods={() => {}}
              />
            </View>
          </ScrollView>
        </View>
        <ProfileSettings 
          visible={modalVisible} 
          onClose={handleCloseModal} 
          title="Profile Settings"
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#edf5fe',
    borderRadius: 8,
    height: 'auto',
    marginBottom: 10,
    justifyContent: 'center',
    alignContent: 'center'
  },
  metricsContainer: {
    flexWrap: 'wrap',
    alignContent: 'center'
  },
  singleMetricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
  },
  metricCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    margin: 8,
  },
  metricText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
});