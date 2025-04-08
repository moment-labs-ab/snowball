import { View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native'
import React, {useState} from 'react'
import EmojiSelector from "react-native-emoji-selector";


interface EmojiModalProps {
    color: string;
    emoji: string;
    handleEmojiSelect: (selectedEmoji: string)=> void
  }

const EmojiModal = ({color, emoji, handleEmojiSelect}: EmojiModalProps) => {

const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                backgroundColor: color,
                marginRight: 10,
              }}
              onPress={() => setIsEmojiSelectorVisible(true)}
            >
              <Text style={{ color: "white" }}>{emoji}</Text>
            </TouchableOpacity>
            <Modal
              visible={isEmojiSelectorVisible}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsEmojiSelectorVisible(false)}
                  >
                    <Text style={{ color: "white" }}>Close</Text>
                  </TouchableOpacity>
                  <EmojiSelector
                    onEmojiSelected={handleEmojiSelect}
                    columns={8}
                  />
                </View>
              </View>
            </Modal>
    </View>
  )
}

export default EmojiModal

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

})