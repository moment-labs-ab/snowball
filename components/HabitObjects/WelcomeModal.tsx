import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import HabitCardExample from "./HabitCardExample";
import ProgressExample from "./ProgressExample";
import Feather from '@expo/vector-icons/Feather';
import EnableNotificationButton from "../ProfileSettings/EnableNotification";

type ModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const { width } = Dimensions.get("window");
const modalWidth = width * 0.9;

const WelcomeModal = ({ isOpen, setIsOpen }: ModalProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const slides = [
    <View key="slide1" style={styles.bodyContainer}>
      <Text style={styles.body}>
        Welcome to <Text style={styles.highlight}>Snowball.</Text> We're glad you're here.
      </Text>
      <Text>

      </Text>
    </View>,
    <View key="slide2" style={[styles.bodyContainer, {marginTop: 10}]}>
    
    <Text style={styles.body}>
      Our goal is to make tracking your habits & goals{" "}
      <Text style={styles.highlight}>simple</Text>.
    </Text>
    <Text style={{marginBottom:20, textAlign:'center', fontWeight: 300}}>
      You can track your habits by swiping right (or left to delete a tracking).
    </Text>
    <HabitCardExample />
  </View>,
    <View key="slide3" style={styles.bodyContainer}>
      <Text style={styles.body}>
        The key is to be <Text style={styles.highlight}>consistent</Text> and
        stay the course one day at a time.
      </Text>
      <ProgressExample />
    </View>,
    <View key="slide4" style={[styles.bodyContainer, {alignItems:'center', height:'80%'}]}>
    <View style={styles.iconWrapper}>
      <Feather name="bell" size={24} color="#3e4e88" />
    </View>
    <Text style={styles.body}>
      You can also enable notifications to help stay on track.
    </Text>
    <Text style={styles.subText}>
      Adjust the time you receive your notification in settings.
    </Text>
    <EnableNotificationButton />
  </View>
  ,
    <View key="slide5" style={styles.bodyContainer}>
      <Text style={styles.body}>
        Our <Text style={styles.highlight}>commitment</Text> is to keep
        improving this app, empowering you to become your best self.
      </Text>
      <TouchableOpacity onPress={() => setIsOpen(false)} style={{backgroundColor: '#3e4e88',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop:20}}>
      <Text style={{color:'white', fontWeight:'600', fontSize:16}}>Let's Get Started! 🎉</Text>
      </TouchableOpacity>
    </View>,
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / modalWidth);
    setCurrentPage(index);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Hi There! 👋</Text>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {slides.map((slide, index) => (
              <View key={index} style={{ width: modalWidth }}>{slide}</View>
            ))}
          </ScrollView>

          <View style={styles.paginationWrapper}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { opacity: currentPage === index ? 1 : 0.2 },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WelcomeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    height: "45%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  bodyContainer: {
    paddingHorizontal: 20,
    justifyContent: "center",
    alignContent:'center',
    height: "100%",
  },
  body: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "300",
  },
  highlight: {
    color: "#8BBDFA",
    fontWeight: "600",
  },
  paginationWrapper: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  paginationDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#3e4e88",
    marginHorizontal: 6,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    marginBottom: 24, // space below the icon
    alignItems: "center", // center icon horizontally
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius:50,
    backgroundColor: "#F5F7FF",
  },
  subText: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: "300",
  },
});
