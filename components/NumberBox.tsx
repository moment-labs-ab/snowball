import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface NumberBoxProps {
  title: string;
  placeholder: number;
  handleChangeNumber: (newNumber: number) => void;
  otherStyles?: ViewStyle;
}

const NumberBox: React.FC<NumberBoxProps> = ({ title, placeholder, handleChangeNumber, otherStyles }) => {
  const [number, setNumber] = useState<number>(placeholder);

  const handleIncrease = () => {
    const newNumber = number + 1;
    setNumber(newNumber);
    handleChangeNumber(newNumber);
  };

  const handleDecrease = () => {
    const newNumber = number > 0 ? number - 1 : 0;
    setNumber(newNumber);
    handleChangeNumber(newNumber);
  };

  return (
    <View style={[styles.container, otherStyles]}>
      <View style={styles.numberBox}>
        <TouchableOpacity onPress={handleDecrease} style={styles.buttonBorder}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.number}>{number}</Text>
        <TouchableOpacity onPress={handleIncrease} style={styles.buttonBorder}>
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
    alignContent:'center'
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  numberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  buttonBorder:{
    width:30,
    height:30,
    borderRadius:100,
    borderWidth:1,
    justifyContent:'center',
    alignContent:'center',
    alignItems:'center'

  },
  
  buttonText: {
    fontSize: 24,
  },
  number: {
    marginHorizontal: 20,
    fontSize: 24,
  },
});

export default NumberBox;
