import icons from "@/constants/icons";
import React, {useEffect} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import SettingsButton from "@/components/SettingsButton";
import Settings from "@/components/Profile/SettingsHome";
import MiniHabitContainer from "./MiniHabitContainer";
import MiniGoalsContainer from "./MiniGoalsContainer";
import images from "../../constants/images";
import PremiumButton from "../NonPremiumComponents/PremiumButton";
import PremiumModal from "../NonPremiumComponents/PremiumModal";


interface ProfileCardProps {
  profileImage: string; // URL for the profile picture
  name?: string;
  description: string;
  onProfilePicturePress: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profileImage,
  name,
  description,
  onProfilePicturePress,
}) => {
  console.log("icons:", icons.settings);
  useEffect(()=>{

  }, [name])
  return (
<View style={styles.container}>
  <View style={styles.headerRow}>
    <TouchableOpacity onPress={onProfilePicturePress}>
    <Image source={images.snowballlogo} style={styles.logo} />

      </TouchableOpacity>
    
    <View style={[styles.settingsContainer, { marginRight: -25}]}>
      {/** 
<PremiumButton label={"Snowball Premium"} content={<PremiumModal/>}/>  
*/}  
    <SettingsButton
        label="Settings"
        action={() => {
          console.log("Settings button Pressed");
        }}
        content={<Settings />}
      />
    </View>
  </View>

  <View style={styles.textContainer}>
    <Text style={styles.name}>{name}</Text>
  </View>
  <View style={{flexDirection:'row', justifyContent:'center', alignContent:'space-between', gap:20, marginTop:20}}>

      <MiniHabitContainer />
      <MiniGoalsContainer/>
  </View>
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderRightWidth:1,
    borderLeftWidth:1,
    borderBottomRightRadius:30,
    borderBottomLeftRadius:30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsContainer: {
    justifyContent: 'center',
    flexDirection:'row',
    alignItems:'center',
    alignContent:'center'
  },
  profileImage: {
    backgroundColor: "lightblue",
    width: 60,
    height: 60,
    borderRadius: 40,
    marginRight: 10,
  },
  textContainer: {
    marginTop: 5,
  },
  name: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
  settingsButton: {
    backgroundColor: "black",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  habitGoalContainer:{
    borderWidth:1,
    width:100,
    height:60,
    borderRadius:5
  },
  logo: {
    width: 70,
    height: 70,
  },
});

export default ProfileCard;
