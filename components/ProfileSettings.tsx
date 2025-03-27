// ProfileSettings.tsx
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import ProfileButton from './ProfileButton';
import Modal from 'react-native-modal';
import AntDesign from '@expo/vector-icons/AntDesign';
import EditProfile from './ProfileSettings/EditProfile';
import ProfileStats from './ProfileSettings/ProfileStats';


interface ProfileSettingsProp {
  visible: boolean;
  onClose: () => void;
  title: string;
}

const ProfileSettings = ({ visible, onClose, title }: ProfileSettingsProp) => {
  const screenWidth = Dimensions.get('window').width;
  const closeProfileSettings = ()=>{
    onClose()
  }

  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={onClose}
      swipeDirection={["right"]}
      propagateSwipe={true}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      animationInTiming={300}
      animationOutTiming={300}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
      statusBarTranslucent
      style={{
        margin: 0,
        justifyContent: 'flex-start',
        width: screenWidth,
        alignSelf: 'flex-end'
      }}
      swipeThreshold={50}
    >
      <View style={{ 
        backgroundColor: 'white',
        height: '100%',
        width: '98%',
        alignSelf: 'flex-end',
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: -1,
          height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <ScrollView 
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View className='mt-2 px-4'>
            <View className="flex-row justify-between items-center mb-1 mt-20">
              <Text className="text-xl font-bold">{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <View
            style={{
              height: 2,
              width: '98%',
              backgroundColor: '#3e4e88',
              alignSelf: 'center',
              marginTop: 4,
              marginBottom: 6
            }}
          />
            <ProfileButton 
              label='Profile' 
              action={() => { }}
              content={<EditProfile/>} 
            />
            <ProfileButton 
              label='Habits' 
              action={() => {}} 
            />
            <ProfileButton 
              label='Terms & Conditions' 
              action={() => {  }} 
            />
            <ProfileButton 
              label='Privacy Policy' 
              action={() => { }} 
            />
            <ProfileButton 
              label='Feedback' 
              action={() => {  }} 
            />
            <ProfileButton 
              label='Donate' 
              action={() => {}} 
            />
            <ProfileButton 
              label='Profile Stats' 
              action={() => { }}
              content={<ProfileStats/>}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ProfileSettings;