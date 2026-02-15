import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '@/context/Context';
import { getUserLoginCount, getLifetimeHabitStats } from '@/lib/supabase_profile';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LifetimeHabitStats } from '@/types/types';
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

const ProfileStats = () => {
  const { user } = useGlobalContext();
  const [userLoginCount, setUserLoginCount] = useState(0);
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeHabitStats>();

  const fetchLoginCounts = async (user_id: string) => {
    const data = await getUserLoginCount(user_id);
    if (data) {
      setUserLoginCount(data);
    }
  };

  const fetchLifetimeStats = async (user_id: string) => {
    const data = await getLifetimeHabitStats(user_id);
    if (data) {
      setLifetimeStats(data);
    }
  };

  useEffect(() => {
    if (!user.userId) {
      return;
    }

    fetchLoginCounts(user.userId);
    fetchLifetimeStats(user.userId);
  }, [user.userId]);

  const MetricItem = ({ icon, text }: { icon: React.ReactElement; text: string }) => (
    <View style={styles.singleMetricsContainer}>
      <TouchableOpacity style={styles.metricCircle}>{icon}</TouchableOpacity>
      <Text>{text}</Text>
    </View>
  );

  if (!lifetimeStats) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3e4e88" />
      </View>
    );
  }

  return (
    <ScrollView>
      <View className="px-3">
        <View style={styles.metricsContainer}>
          <MetricItem
            icon={<Feather name="check-circle" size={30} color="black" />}
            text={`${Math.floor(lifetimeStats.completionRate)}% Completion Rate`}
          />
          <MetricItem
            icon={<SimpleLineIcons name="fire" size={30} color="black" />}
            text={`${lifetimeStats.longestStreak} ${lifetimeStats.longestStreak === 1 ? 'Day' : 'Days'} Streak`}
          />
          <MetricItem
            icon={<SimpleLineIcons name="trophy" size={30} color="black" />}
            text={lifetimeStats.mostConsistentHabit || ''}
          />
          <MetricItem
            icon={<Feather name="calendar" size={30} color="black" />}
            text={`${lifetimeStats.totalDaysTracked} Total Days Tracked`}
          />
          <MetricItem
            icon={<SimpleLineIcons name="login" size={30} color="black" />}
            text={`Join Date: ${lifetimeStats.joinDate?.toLocaleDateString()}`}
          />
          <MetricItem
            icon={<MaterialIcons name="update" size={30} color="black" />}
            text={`${userLoginCount} Account Logins`}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileStats;

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#edf5fe',
    borderRadius: 8,
    height: 'auto',
    marginBottom: 10,
    justifyContent: 'center',
    alignContent: 'center',
  },
  metricsContainer: {
    flexWrap: 'wrap',
    alignContent: 'center',
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
