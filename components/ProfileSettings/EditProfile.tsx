import { View, Text, StyleSheet, SafeAreaView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getCurrentUser, handleUserDeletion } from '@/lib/supabase_user'
import CustomButton from '../CustomButtom'
import { useGlobalContext } from '@/context/Context'
import { router } from 'expo-router'

const EditProfile = () => {
  const { isLoggedIn, setIsLoggedIn, setUser, user } = useGlobalContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const getUserData = async () => {
    try {
      const userDataPull = await getCurrentUser()
      if (userDataPull) {
        setUser(userDataPull)
      } else {
        Alert.alert('Error', 'Unable to fetch user data')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data')
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    getUserData().finally(() => setIsLoading(false))
  }, [])

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            if (!user?.userId) {
              Alert.alert('Error', 'User ID not found')
              return
            }

            try {
              setIsDeletingAccount(true)
              const result = await handleUserDeletion(user.userId)

              if (result.success) {
                // Reset global state
                setIsLoggedIn(false);
                setUser({
                  email: '',
                  username: '',
                  name: '',
                  userId: '',
                  premiumUser:false
                })
                
                // Show success message and redirect
                Alert.alert(
                  'Success',
                  'Your account has been deleted successfully',
                  [{
                    text: 'OK',
                    onPress: () => router.replace('/sign-in')
                  }]
                )
              } else {
                throw new Error(result.message)
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to delete account. Please try again later.'
              )
              console.error('Error deleting account:', error)
            } finally {
              setIsDeletingAccount(false)
            }
          }
        }
      ],
      { cancelable: true }
    )
  }
  const changePasswordRequested = ()=>{
    console.log("Change Password Requested")

  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3e4e88" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        {user ? (
          <>
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user.email}</Text>
              
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{user.name}</Text>

              <TouchableOpacity onPress={changePasswordRequested} style={styles.passwordButton}>
                <Text style={styles.password}>Change Password</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger Zone</Text>
              <CustomButton
                title={isDeletingAccount ? "Deleting Account..." : "Delete Account & All User Data"}
                handlePress={handleDeleteAccount}
                containerStyles="mt-8 px-2 bg-delete"
                isLoading={isDeletingAccount}
                otherMethods={() => {}}
              />
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>Unable to load user data</Text>
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  passwordButton:{
    alignItems:'center'

  },
  password:{
    color: 'blue',
    textDecorationLine:'underline',
    fontSize:16,
    marginTop:10

  },
  container: {
    flex: 1,
    backgroundColor: '#edf5fe',
  },
  content: {
    padding: 16,
    
  },
  profileInfo: {
    marginBottom: 100,
    paddingLeft: 4
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    color: 'black',
    fontWeight:'800',
    paddingLeft:10
  },
  dangerZone: {
    marginTop: 40,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff4444',
    marginBottom: 16,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 16,
  },
})

export default EditProfile