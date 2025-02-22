import { View, Text, StyleSheet, TextInput,KeyboardAvoidingView, Platform  } from "react-native";
import React, {useState, useEffect} from "react";

const NotificationItem = () => {
    const [name, setName] = useState("")
  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
    <View>
    <View style={{ flex: 1 }}>
      <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  borderRadius: 5,
                }}
                value={name}
                onChangeText={setName}
                placeholder="Make your own or Choose One."
                placeholderTextColor={"#898989"}
                textAlignVertical="center"
              />
    </View>
    </View>
    </KeyboardAvoidingView>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
  },
  miniLabel: {
    fontSize: 13,
    fontWeight: "200",
    marginBottom: 5,
    paddingLeft: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#000',
  },
});
