import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Or another icon set you use

interface CheckmarkCircleProps {
  size?: number; // optional size prop
}

const CheckmarkCircle: React.FC<CheckmarkCircleProps> = ({ size = 24 }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#61cf63', // light neutral gray
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="checkmark" size={size * 0.6} color="black" />
    </View>
  );
};

export default CheckmarkCircle;
