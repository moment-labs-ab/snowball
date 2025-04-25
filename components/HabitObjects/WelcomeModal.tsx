import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import HabitCardExample from "./HabitCardExample";
import ProgressExample from "./ProgressExample";
import Feather from "@expo/vector-icons/Feather";

import EnableNotificationButton from "../ProfileSettings/EnableNotification";
import WelcomeIntroSlide from "./WelcomeIntroSlide";

type ModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const WelcomeModal = ({ isOpen, setIsOpen }: ModalProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { width, height } = useWindowDimensions();
  const modalWidth = width * 0.9;
  const modalHeight = height * 0.5; // More adaptive height

  const slides = [
    <WelcomeIntroSlide key="slide1" />,
    <View key="slide2" style={[styles.bodyContainer, { marginTop: 10 }]}>
      <Text style={styles.body}>
        Our goal is to make tracking your habits & goals{" "}
        <Text style={styles.highlight}>simple</Text>
      </Text>
      <Text style={styles.subText}>
        Track your habits by swiping right or left
      </Text>
      <HabitCardExample />
    </View>,
    <View key="slide3" style={styles.bodyContainer}>
      <Text style={styles.body}>
        The key is to be <Text style={styles.highlight}>consistent</Text> and
        stay the course one day at a time
      </Text>
      <ProgressExample />
    </View>,
    <View
      key="slide4"
      style={[styles.bodyContainer, { alignItems: "center", height: "80%" }]}
    >
      <View style={styles.iconWrapper}>
        <Feather name="bell" size={24} color="#3e4e88" />
      </View>
      <Text style={styles.body}>
        <Text style={styles.highlight}>Enable</Text> notifications to stay on
        track
      </Text>
      <Text style={styles.subText}>
        Adjust the time a notification is sent in settings
      </Text>
      <EnableNotificationButton />
    </View>,
    <View
      key="slide5"
      style={[styles.bodyContainer, { alignItems: "center", height: "80%" }]}
    >
      <View style={styles.iconWrapper}>
        <AntDesign name="hearto" size={24} color="#3e4e88" />
      </View>
      <Text style={styles.body}>
        We're in this together
      </Text>
      <Text style={styles.body}>
        Your <Text style={styles.highlight}>growth</Text> is our goal
      </Text>
      <TouchableOpacity
        onPress={() => setIsOpen(false)}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaText}>Let's Get Started! 🎉</Text>
      </TouchableOpacity>
    </View>,
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / modalWidth);
    setCurrentPage(index);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalWrapper}>
          <View
            style={[
              styles.modalContainer,
              { width: modalWidth, height: modalHeight },
            ]}
          >
            <View style={styles.headerContainer}>
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
                <View key={index} style={{ width: modalWidth }}>
                  {slide}
                </View>
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
  modalWrapper: {
    paddingHorizontal: 20, // you can adjust this value for more/less space
    width: "100%",
    alignItems: "center",
  },
  modalContainer: {
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
    alignContent: "center",
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
  subText: {
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "300",
    fontSize: 14,
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
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 50,
    backgroundColor: "#F5F7FF",
  },
  ctaButton: {
    backgroundColor: "#3e4e88",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
