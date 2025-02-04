import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { signOut } from '@/lib/supabase';
import { useGlobalContext } from '@/context/Context';
import { router } from 'expo-router';
import CustomButton from '../CustomButtom';

const TempLogoutView = () => {
    const { setIsLoggedIn, setUser, isLoggedIn, user } = useGlobalContext();


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
                  isLoggedIn.isLoggedIn = false;
                  setUser({
                    email: '',
                    username: '',
                    userId: ''
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
  return (
    
    <CustomButton
    title="Sign Out"
    handlePress={logout}
    containerStyles="mt-8 px-2 bg-secondary"
    otherMethods={() => {}}
  />
    
  )
}

export default TempLogoutView