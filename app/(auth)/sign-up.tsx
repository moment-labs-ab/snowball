import { View, Text, SafeAreaView, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import images from '../../constants/images';
import { Link, router } from 'expo-router'
import FormField from '../../components/FormField';

import CustomButton from '@/components/CustomButtom';

import { useGlobalContext } from '@/context/Context';
import { signUpWithEmail } from '@/lib/supabase';

const SignUp = () => {

  const { setUser, setIsLoggedIn } = useGlobalContext();

  /** Use State Field -- used in the FormField component */
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [isSubmitting, setisSubmitting] = useState(false)

  const submit = async () =>{
    if(form.username === "" || form.email === "" || form.password === ""){
      Alert.alert('Error', 'Please fill in all the fields')
    }
    setisSubmitting(true)

    try{
      const result = await signUpWithEmail(form.email, form.password, form.username)
      setUser({
        email: result?.email || '',
        username: form.username,
        userId: result?.id || ''
      })
      setIsLoggedIn({isLoggedIn: true})
      if(result){
        router.replace('/habits')

      }
      }catch (error){
        Alert.alert(String(error))
        setisSubmitting(false)
    }
    
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

        <Text className="text-2xl text-black text-semibold mt-10 font-psemibold pl-3"> Sign Up to Snowball</Text>
        <FormField 
          title = "Username"
          value = {form.username}
          handleChangeText ={(e) => setForm({ ...form, username:e})}
          otherStyles="mt-10 px-3"
        />

        <FormField 
          title = "Email"
          value = {form.email}
          handleChangeText ={(e) => setForm({ ...form, email:e})}
          otherStyles="mt-7 px-3"
          keyboardType="email-address"
        />
        <FormField 
          title = "Password"
          value = {form.password}
          handleChangeText ={(e) => setForm({ ...form, password:e})}
          otherStyles="mt-7 px-3"
        />

        <CustomButton 
          title = 'Sign Up'
          handlePress = {submit}
          containerStyles = "mt-7 px-2 bg-secondary"
          isLoading = {isSubmitting}
          otherMethods={()=>{}}
        />

        <View className="justify-center pt-5 flex-row gap-2">
        <Text className="text-lg text-black-100 font-pregular">Have an account already?</Text>
        <Link href="/sign-in" className='text-lg font-psemibold text-secondary'>Sign In</Link>

        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp