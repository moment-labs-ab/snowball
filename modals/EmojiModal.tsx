import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import React, { useState } from "react";
import EmojiSelector from "react-native-emoji-selector";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

interface EmojiModalProps {
  emoji: string;
  handleEmojiSelect: (selectedEmoji: string) => void;
  color?: string;
  height?: number;
  width?: number;
  emojiSize?: number;
}

const EmojiModal = ({
  emoji,
  handleEmojiSelect,
  color = "#CDCDE0  ",
  height = 40,
  width = 40,
  emojiSize = 18,
}: EmojiModalProps) => {
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={{
          width: width,
          height: height,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "black",
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 10,
          position: "relative", // important for absolute children
        }}
        onPress={() => setIsEmojiSelectorVisible(true)}
      >
        <Text style={{ color: "white", fontSize: emojiSize }}>{emoji}</Text>

        {/* Pen icon in bottom-right */}
        <View
          style={{
            position: "absolute",
            top: 1,
            right: 1,
          }}
        >
          <Feather name="edit-2" size={8} color="black" />
        </View>
      </TouchableOpacity>
      <Modal
        visible={isEmojiSelectorVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={{ alignContent: "flex-start" }}
              onPress={() => setIsEmojiSelectorVisible(false)}
            >
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
            <EmojiSelector
              onEmojiSelected={(selectedEmoji) => {
                handleEmojiSelect(selectedEmoji);
                setIsEmojiSelectorVisible(false);
              }}
              columns={8}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EmojiModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
  },
  closeButton: {
    alignSelf: "center",
    padding: 10,
    backgroundColor: "black",
    borderRadius: 5,
  },
});
