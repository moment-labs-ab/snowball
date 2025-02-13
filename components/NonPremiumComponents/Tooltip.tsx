// components/Tooltip.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip = ({ text, children }: TooltipProps) => {
  return (
    <View style={styles.tooltipContainer}>
      {children}
      <View style={styles.tooltip}>
        <Text style={styles.tooltipText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    top: -30,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 5,
  },
  tooltipText: {
    fontSize: 12,
  },
});

export default Tooltip;
