import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal, Switch, Image } from 'react-native'
import React, {useState} from 'react'
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ProfileToggleState } from './Types';
import SettingUpdate from './SettingUpdate';
import SettingPage from './SettingPage';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";


interface SettingProps{
    label: string
    accountSetting: string,
    index: number,
    iconType: string,
    icon: Object,
    id: string
    selectValue?: string,
    toggleValue?: boolean,
    handleTouch?: () => void,
    handleDeleteTouch?: () => void,
    toggleSetState?: React.Dispatch<React.SetStateAction<ProfileToggleState>>
    content?:React.ReactNode;
}

const Setting: React.FC<SettingProps> = ({label, accountSetting, index, iconType, icon, id, selectValue, toggleValue, toggleSetState, handleTouch, handleDeleteTouch, content}) => {
  const [isVisible, setIsVisible] = useState(false);

    const toggleContent = () => {
        setIsVisible(!isVisible);
    };

    console.log(`accountSetting: ${accountSetting} | id: ${id} | value: ${selectValue} `);

    let iconColor;

    if (id === "delete-account") {
        iconColor = "#ff0000";
    }
    else if (id === "profile-stats") {
        iconColor = "#8BBDFA";
    }
    else if (id == "premium"){
        iconColor = "#FAC88B";
    }
    else {
        iconColor = "#616161";
    }

    return (
      <SafeAreaView key={id}>
          <View style={styles.container}>
            <View style={[styles.rowWrapper, index === 0 && { borderTopWidth: 0 }]}>
                <TouchableOpacity onPress={() => {
                    if (accountSetting === 'modal' && handleTouch) {
                        handleTouch();
                    }
                    else if (id === 'delete-account' && handleDeleteTouch) {
                        handleDeleteTouch();
                    }
                    else {
                        setIsVisible(true); 
                    }
                    }}>
                    <View style={styles.row}>
                        {iconType === "feather" && <FeatherIcon name={icon as string} color={iconColor} size={22} style={{ marginRight: 12 }} />}
                        {iconType === "local" && <Image source={icon} resizeMode='contain' tintColor="#8BBDFA" className='w-5 h-5' style={{ marginRight: 12 }}/>}
                        {iconType === "material" && icon == 'crown' && (<MaterialCommunityIcons name='crown' color={iconColor} size={22} style={{ marginRight: 12 }} />)}

                        <Text style={id === "delete-account" ? styles.rowLabelDelete : styles.rowLabel}>{label}</Text>
                        <View style={styles.rowSpacer} />

                        {accountSetting === 'select' && (
                            <Text style={styles.rowValue}>{selectValue}</Text>
                        )}

                        {accountSetting === 'toggle' && (
                            <Switch
                                value={toggleValue}
                                onValueChange={value => toggleSetState && toggleSetState(prevForm => ({ ...prevForm, [id]: value }))}
                            />
                        )}

                        {accountSetting === 'page' && (
                            <Text style={styles.rowValue}></Text>
                        )}

                        {['select', 'link', 'page'].includes(accountSetting) && (
                            <FeatherIcon name="chevron-right" color="#ababab" size={22} style={{ marginLeft: 'auto' }} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>

              <Modal
                  visible={isVisible}
                  animationType="slide"
                  onRequestClose={toggleContent}
                  presentationStyle='pageSheet'
                  
              >
                {accountSetting === 'select' && selectValue && (
                    <SettingUpdate isVisible={setIsVisible} settingId={id} settingName={label} settingValue={selectValue} />
                )}

                {accountSetting === 'select' && id === "password" && (
                    <SettingUpdate isVisible={setIsVisible} settingId={id} settingName={label} settingValue={""} />
                )}

                {accountSetting === 'page' && (
                    <SettingPage currentSettingValue={"Page props from Setting.tsx"} label={label} content={content} toggleContent={toggleContent}/>
                )}
              </Modal>
          </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
      padding: 2,
      borderTopColor: 'black',
  },
  button: {
      backgroundColor: '#bedafc',
      padding: 15,
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
    marginRight: 25,
    marginTop: 15
  },
  rowWrapper: {
    paddingLeft: 24,
    borderTopWidth: 1,
    borderColor: '#e3e3e3',
    backgroundColor: '#fff',
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 10,
},
row: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 24,
},
rowLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#212121'
},
rowLabelDelete: {
    fontSize: 17,
    fontWeight: '500',
    color: '#ff0000'
},
rowSpacer: {
    flex: 1
},
rowValue: {
    fontSize: 17,
    fontWeight: '500',
    color: '#616161',
    marginRight: 4,
},
});

export default Setting;