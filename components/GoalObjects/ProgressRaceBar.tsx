import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface ProgressRaceBarProps {
  actual: number;
  expectedNow: number;
  total: number;
  totalDaysLeft: number;
  color: string,
  height?: number;
  style?: object;
}

const ProgressRaceBar: React.FC<ProgressRaceBarProps> = ({
  actual,
  expectedNow,
  total,
  totalDaysLeft,
  color,
  height = 15,
  style = {},
}) => {
  // Ensure values are valid and calculate percentages
  const safeActual = Math.max(0, Math.min(actual, total));
  const safeExpected = Math.max(safeActual, Math.min(expectedNow, total));
  
  // Calculate widths as percentages
  const actualWidth = (safeActual / total) * 100;
  const expectedWidth = ((safeExpected - safeActual) / total) * 100;
  const remainingWidth = 100 - actualWidth - expectedWidth;

  useEffect(()=>{

  }, [color])

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.barContainer, { height }]}>
        {/* Completed Progress */}
        <View 
          style={
            { width: `${actualWidth}%`, backgroundColor: color }
          }
        />
        
        {/* Expected Progress */}
        <View 
          style={[
            styles.section, 
            styles.expectedSection,
            { width: `${expectedWidth}%` }
          ]}
        />
        
        {/* Remaining Progress */}
        <View 
          style={[
            styles.section, 
            styles.remainingSection,
            { width: `${remainingWidth}%` }
          ]}
        />
      </View>
      
      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>
              <Text style={{color:color}}>{safeActual}</Text>
              <Text style ={{color:'#bababa'}}> / </Text>
              <Text style ={{color:"#afd2fc"}}>{safeExpected}</Text>
              <Text style ={{color:'#bababa'}}> / </Text>
              <Text style ={{color:'#6f6e79'}}>{totalDaysLeft} </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 5,
  },
  barContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  section: {
    height: '100%',
  },
  expectedSection: {
    backgroundColor: "#afd2fc", //gray
  },
  remainingSection: {
    backgroundColor: '#6f6e79', // Light Gray
  },
  labelsContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: '#666',
    fontWeight:'600'
  },
});

export default ProgressRaceBar;