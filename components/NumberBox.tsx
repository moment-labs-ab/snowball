import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface NumberBoxProps {
  title: string;
  placeholder: number;
  handleChangeNumber: (newNumber: number) => void;
  otherStyles?: ViewStyle;
}

const NumberBox: React.FC<NumberBoxProps> = ({
  title,
  placeholder,
  handleChangeNumber,
  otherStyles,
}) => {
  const [number, setNumber] = useState<number>(placeholder);

  const handleIncrease = () => {
    const newNumber = number + 1;
    setNumber(newNumber);
    handleChangeNumber(newNumber);
  };

  const handleDecrease = () => {
    const newNumber = Math.max(number - 1, 0);
    setNumber(newNumber);
    handleChangeNumber(newNumber);
  };

  return (
    <View style={[styles.container, otherStyles]}>
      <View style={styles.numberBox}>
        <TouchableOpacity onPress={handleDecrease} style={styles.circleButton}>
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.numberText}>{number}</Text>

        <TouchableOpacity onPress={handleIncrease} style={styles.circleButton}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  numberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    elevation: 2,
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  numberText: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 24,
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
});

export default NumberBox;
