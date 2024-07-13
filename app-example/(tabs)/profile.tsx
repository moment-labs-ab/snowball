import { StyleSheet, View, Text } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const Profile = () => {
  return (
    <View>
    <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
    </ThemedView>
    </View>
  )
}

const styles = StyleSheet.create({
    headerImage: {
      color: '#808080',
      bottom: -90,
      left: -35,
      position: 'absolute',
    },
    titleContainer: {
      flexDirection: 'row',
      gap: 8,
    },
  });
  

export default Profile