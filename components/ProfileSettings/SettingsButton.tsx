import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal } from 'react-native'
import React, {useState} from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

//import Modal from 'react-native-modal'


interface SettingButtonProps{
    label: string,
    action?: () => void
    content?: React.ReactNode;
    // Optional prop to determine if content should be shown in a modal
    useModal?: boolean;
}

const SettingsButton: React.FC<SettingButtonProps> = ({label, action, content, useModal}) => {
  const [isVisible, setIsVisible] = useState(false);

    const toggleContent = () => {
        setIsVisible(!isVisible);
    };
    return (
      <SafeAreaView>
          <View style={styles.container}>
              <TouchableOpacity style={styles.settingsButton} onPress={toggleContent}>
                <Feather name="settings" size={30} color="black" />
              </TouchableOpacity>

              <Modal
                  visible={isVisible}
                  animationType="slide"
                  onRequestClose={toggleContent}
                  presentationStyle='pageSheet'
                  
              >
                  <SafeAreaView style={styles.modalContainer}>
                      <View style={styles.headerContainer}>
                          <TouchableOpacity 
                              style={styles.backButton}
                              onPress={toggleContent}
                          >
                              <AntDesign name="close" size={24} color="black" />
                              
                          </TouchableOpacity>
                          <Text style={styles.headerText}>{label}</Text>
                      </View>
                      <View style={styles.contentContainer}>
                          {content}
                      </View>
                  </SafeAreaView>
              </Modal>
          </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
      borderTopColor: 'black',
  },
  button: {
      backgroundColor: '#bedafc',
      marginVertical: 6,
      borderRadius: 8,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      borderColor: '#8BBDFA',
      borderWidth: 2,
      flexDirection: 'row'
  },
  buttonText: {
      color: '#3e4e88',
      fontSize: 20,
      fontWeight: '600'
  },
  modalContainer: {
      flex: 1,
      backgroundColor: '#edf5fe',
  },
  headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#edf5fe',
      height:60,
      marginBottom:10
  },
  backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      left: 16,
      zIndex: 1,
  },
  backButtonText: {
      marginLeft: 4,
      fontSize: 16,
      color: 'black',
  },
  headerText: {
      flex: 1,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '600',
      color: '#3e4e88',
  },
  contentContainer: {
      flex: 1,
      backgroundColor: '#edf5fe',
  },
  settingsButton: {
    alignSelf: 'flex-start',
}
});

export default SettingsButton;