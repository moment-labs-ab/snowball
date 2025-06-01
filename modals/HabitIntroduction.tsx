import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const HabitIntroduction: React.FC<Props> = ({ visible, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { width, height } = Dimensions.get("window");
  const modalWidth = width * 0.9;

  const slides = [
    { title: "WooHoo!!", subtitle: "way to make your first habit! Here are some helpful tips" },
    { title: "High quality Art work", subtitle: "... for a fraction of the price" },
    { title: "Top Notch Artists", subtitle: "... all in one place" },
    { title: "Best deal on the market", subtitle: "... let's find your next art" },
    { title: "It's all about art", subtitle: "... seriously, it is" },
  ];

  const setSliderPage = (event: any) => {
    const { x } = event.nativeEvent.contentOffset;
    const indexOfNextScreen = Math.floor(x / modalWidth);
    if (indexOfNextScreen !== currentPage) {
      setCurrentPage(indexOfNextScreen);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { width: modalWidth }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ fontWeight: "bold" }}>Close</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            onScroll={setSliderPage}
            style={{ width: modalWidth }}
          >
            {slides.map((slide, index) => (
              <View
                key={index}
                style={{ width: modalWidth, height: "100%", justifyContent: "center" }}
              >
                <View style={styles.wrapper}>
                  <Text style={styles.header}>{slide.title}</Text>
                  <Text style={styles.paragraph}>{slide.subtitle}</Text>
                </View>
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
    </Modal>
  );
};

export default HabitIntroduction;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#edf5fe",
    borderRadius: 16,
    height: "50%",
    alignItems: "center",
    opacity: 0.95,
    borderWidth: 1,
    borderColor: "black",
    overflow: "hidden",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  wrapper: {
    justifyContent: "center",
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 17,
    textAlign: "center",
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
});
