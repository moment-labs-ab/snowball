import { useGlobalContext } from "@/context/Context";
import React, {useEffect} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import SettingsButton from "./SettingsButton";
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
  const {user} = useGlobalContext();

  useEffect(()=>{

  }, [name, user.premiumUser])
  return (
<View style={styles.container}>

  <View style={styles.headerRow}>
    <Image source={images.snowballlogo} style={styles.logo} />



      <View style={styles.textContainer}>
    <Text style={styles.name}>{name}</Text>
  </View>
  <View style={styles.settingsContainer}>
    {user.premiumUser ?  <></>: <PremiumButton label={""}/>}
  
  <SettingsButton
      label="Settings"
      action={() => {
      }}
      content={<Settings />}
    />
  </View>
  
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
    padding: 10,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    margin:1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures left and right spacing
  },
  settingsContainer: {
    alignItems: 'center',
    alignContent:'center',
    flexDirection:'row'
  },
  profileImage: {
    backgroundColor: "lightblue",
    width: 60,
    height: 60,
    borderRadius: 40,
  },
  textContainer: {
    flex: 1, // Takes remaining space between logo and settings
  },
  name: {
    fontSize: 25,
    fontWeight: "bold",
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
    width: 50,
    height: 50,
    marginRight: 10, // Adds spacing to the right of the image
  },
});

export default ProfileCard;
