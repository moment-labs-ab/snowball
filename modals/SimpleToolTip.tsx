import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

type SimpleTooltipProps = {
  text: string;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SimpleTooltip = ({ text, visible, setVisible }: SimpleTooltipProps) => {

    useEffect(()=>{},[])

  return (
    <View style={{ position: 'relative' }}>
      

      {visible && (
        <Modal transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={styles.overlay}
          onPressOut={() => setVisible(false)}
        >
          <View style={styles.tooltipWrapper}>
            {/* Arrow */}
            
    
            {/* Tooltip */}
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{text}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      tooltipWrapper: {
        alignItems: 'center', // Centers the tooltip and the arrow
        justifyContent:'flex-start'

    },
      tooltip: {
        backgroundColor: '#3e4e88',
        padding: 20,
        borderRadius: 8,
        maxWidth: '98%',
        opacity:.9
      },
      tooltipText: {
        color: '#fff',
        fontSize: 18,
        textAlign:'center'
      },
      arrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#333',
        marginBottom: 2, // Space between arrow and tooltip
      },
});
