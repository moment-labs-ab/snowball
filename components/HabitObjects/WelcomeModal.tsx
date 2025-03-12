import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

type ModalProps = {
  isOpen: boolean;
};

const WelcomeModal = ({ isOpen }: ModalProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* Background Overlay */}
      <View style={styles.overlay}>
        {/* Centered Modal Content */}
        <View style={styles.modalContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                setIsVisible(false);
              }}
            >
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Hi There! 👋</Text>
          </View>
          <View style={styles.bodyContainer}>
            <Text style={styles.body}>
              Welcome To{" "}
              <Text style={{ color: "#8BBDFA", fontWeight: "600" }}>
                Snowball
              </Text>
              .
            </Text>

            <Text style={styles.body}>
              Our goal is to make tracking your habits & goals{" "}
              <Text style={{ color: "#8BBDFA", fontWeight: "600" }}>
                simple
              </Text>
              .
            </Text>
            <Text style={styles.body}>
              The key is to be{" "}
              <Text style={{ color: "#8BBDFA", fontWeight: "600" }}>
                consistent
              </Text>{" "}
              and stay the course one day at a time.
            </Text>

            <Text style={styles.body}>
              Our{" "}
              <Text style={{ color: "#8BBDFA", fontWeight: "600" }}>
                commitment{" "}
              </Text>
              is to keep improving this app, empowering you to become your best
              self.
            </Text>

            <Text style={[styles.body, { textAlign: "center", marginTop: 20 }]}>
              Let's Get Started!{" "}
            </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
  },
  modalContainer: {
    width: "80%", // Adjust as needed
    height: "40%",
    backgroundColor: "white",
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    padding: 20,
  },
  body: {
    fontSize: 18,
    textAlign: "left",
    marginBottom: 10,
    fontWeight: "300",
  },
});
