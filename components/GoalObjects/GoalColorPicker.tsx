import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

interface GoalColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colors = [
  "#3e4e88",
  "#8BBDFA",
  "#afb5bf",
  "#FF6B6B", // Coral red
  "#4ECB71", // Green
  "#e0cd02", // Yellow
  "#B86EFF", // Purple
  "#FF9F40", // Orange
  "#FF6B9E", // Pink
  "#43AA8B", // Teal
  "#8F7355", // Brown
];

const GoalColorPicker: React.FC<GoalColorPickerProps> = ({
  selectedColor,
  onColorChange,
}) => {
  const handleSelectColor = (color: string) => {
    onColorChange(color);
  };

  const renderColorCircle = ({ item }: { item: string }) => {
    const isSelected = item === selectedColor;
    return (
      <TouchableOpacity
        onPress={() => handleSelectColor(item)}
        style={[
          styles.circle,
          { backgroundColor: item },
          isSelected && styles.selectedCircle,
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={colors}
        horizontal
        keyExtractor={(item) => item}
        renderItem={renderColorCircle}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCircle: {
    borderColor: "#000",
  },
});

export default GoalColorPicker;
