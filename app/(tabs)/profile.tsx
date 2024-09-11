import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '@/components/CustomButtom'
import { signOut } from '@/lib/supabase'
import { router } from 'expo-router'
import { useGlobalContext } from '@/context/Context'

const Profile = () => {
  const { setIsLoggedIn, setUser, isLoggedIn } = useGlobalContext()

  const logout = async ()=>{
    await signOut();
    setUser({
      email: '',
      username: '',
      userId: ''
    })
    isLoggedIn.isLoggedIn = false
    //setIsLoggedIn({isLoggedIn: false})
    console.log("Profile")
    console.log(isLoggedIn.isLoggedIn)
    router.replace('/sign-in')
  }
  return (
    <SafeAreaView className="bg-background h-full">
    <View>
      <CustomButton
        title = "Sign Out"
        handlePress={()=> logout()}
        containerStyles = "w-full mt-10 px-16 bg-secondary"
        otherMethods={()=>{}}
      />
    </View>
    </SafeAreaView>
  )
}

export default Profile