import icons from '@/constants/icons';
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

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
    console.log("icons:",icons.settings)
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onProfilePicturePress}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    padding: 15,
  },
  profileImage: {
    backgroundColor: 'lightblue',
    width: 100,
    height: 100,
    borderRadius: 40, // Makes the image circular
    marginRight: 10,
  },
  textContainer: {
    //backgroundColor: 'red',
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: 'gray',
  },
  settingsButton: {
    backgroundColor: 'black',
    width: 50,
    height: 50,
    borderRadius: 25, // Makes the image circular
    marginLeft: 2,
    marginBottom: 30,
  },
});

export default ProfileCard;