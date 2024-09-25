import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type TimeFrameButtonProps = {
  title: string;
  handlePress: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
  isSelected?: boolean;
};

const TimeFrameButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading = false,
  isSelected = false
}: TimeFrameButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`rounded-xl w-[42px] h-[42px] border border-primary justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
      disabled={isLoading}
      style={[
        styles.button,
        isLoading && styles.disabled,
        isSelected && styles.selected,
      ]}
    >
      <Text style={[styles.text, isSelected && styles.selectedText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    width: 38,
    height: 38,
    borderColor: "#3e4e88",
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  selected: {
    backgroundColor: '#3e4e88',
  },
  text: {
    color: '#3e4e88',
    fontWeight: '500',
    fontSize: 16,
  },
  selectedText: {
    color: 'white',
  },
});

export default TimeFrameButton;