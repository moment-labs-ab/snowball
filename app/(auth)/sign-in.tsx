import { View, Text, SafeAreaView, ScrollView, Image, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import images from '../../constants/images';
import { Link, router } from 'expo-router'
import FormField from '../../components/FormField';
import CustomButton from '@/components/CustomButtom';

import { signInWithEmail, getCurrentUser } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import GlobalProvider, {useGlobalContext} from '@/context/Context';
import { useContext } from 'react';

const SignIn = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [isSubmitting, setisSubmitting] = useState(false)

  // TODO: The following needs to be refactored and account for sign in failing.
  const submit = async () =>{
    if(form.email === "" || form.password === ""){
      Alert.alert('Error', 'Please fill in all the fields')
    }
    setisSubmitting(true);
    try{
      await signInWithEmail(form.email, form.password)
      const result = await getCurrentUser();
      console.log(result)
      setUser(result)
      setIsLoggedIn(true);


    if(result?.username != undefined){
        router.replace('/habits')
      }
    }catch (error) {
      //Alert.alert(String(error))
    } finally{
      setisSubmitting(false);
    }

    //setisSubmitting(true)
    /**
    try {
      await signIn(form.email, form.password)
      const result = await getCurrentUser();
      setUser(result);
      setisLoggedIn(true);
    
      router.replace('/home')
    } catch (error) {
      Alert.alert('Error', error.message)
      setisSubmitting(false)
    } finally{
      setisSubmitting(false);
    }
    */
  }
  return (
  <SafeAreaView className="bg-background h-full">
      <ScrollView>
        <View className = "w-full justify-center min-h-[75vh] px-4 my-6">
        <Image 
          source = {images.snowballlogo}
          resizeMode='contain'
          className="w-[115px] h-[115px]"
        />

        <Text className="text-2xl text-black text-semibold mt-10 font-psemibold pl-3"> Login to Snowball</Text>

        <FormField 
          title = "Email"
          value = {form.email}
          handleChangeText ={(e:string) => setForm({ ...form, email:e})}
          otherStyles="mt-7 px-2"
          keyboardType="email-address"
        />
        <FormField 
          title = "Password"
          value = {form.password}
          handleChangeText ={(e:string) => setForm({ ...form, password:e})}
          otherStyles="mt-7 px-2"
        />

        <CustomButton 
          title = 'Sign In'
          handlePress = {submit}
          containerStyles = "mt-7 px-5 bg-secondary"
          isLoading = {isSubmitting}
          otherMethods={()=>{}}
        />

        <View className="justify-center pt-5 flex-row gap-2">
        <Text className="text-lg text-black-100 font-pregular">Don't have an account?</Text>
        <Link href="/sign-up" className='text-lg font-psemibold text-secondary'>Sign Up</Link>

        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn