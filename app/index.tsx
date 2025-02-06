import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image} from 'react-native';
import { Redirect, router} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context'

// import {images} from '../constants'
import CustomButton from '../components/CustomButtom'
import images from '../constants/images'

import { useGlobalContext } from '@/context/Context';
import { trackLogin } from '@/lib/supabase';

import Toast from 'react-native-toast-message';

import { GestureHandlerRootView, GestureDetector} from 'react-native-gesture-handler';

 
export default function App() {
  const {isLoading, isLoggedIn, user} = useGlobalContext();
  //figure out loading state
  if(user.email){
    trackLogin(user.userId)
  }

  if(user.username != ''){
    return <Redirect href = "/habits" />
  }
  else{
   return (
    <SafeAreaView className='bg-background h-full'>
    <ScrollView contentContainerStyle = {{height: "100%"}}>
      <View className='w-full justify-center items-center min-h-[85vh] px-2'>
      <Image 
        source={images.snowballlogo}
        className = "w-[200px] px-4 top-0 inset-x-0 h-16"
        resizeMode='contain'
      />

      <View className='relative mt-5'>
        <Text className = "text-5xl text-white font-bold text-center text-primary">Snowball</Text>
      </View>

      <Text className="text-medium font-pregular text-black-100 mt-4 text-center">Grow Your Habits. Grow Your Life.</Text>
      
      <CustomButton 
        title = "Continue with Email"
        handlePress={()=> router.push('/sign-in')}
        containerStyles = "w-full mt-10 bg-secondary"
        otherMethods={()=>{}}
      />

      </View>
    </ScrollView>

    <StatusBar backgroundColor='#161622' style='light'/>
    </SafeAreaView>
  );
   }
}