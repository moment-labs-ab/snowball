import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';

type NumberScrollProps = {
  title?: string;
  placeholder?: string;
  handleChangeText: (e: number) => void;
  otherStyles?: string;
  minValue?: number;
  maxValue?: number;
  initialValue?: number;
  itemWidth?: number;
  otherProps?: Object;
};

const NumberInput = ({ 
  title, 
  placeholder, 
  handleChangeText, 
  otherStyles,
  minValue = 0,
  maxValue = 100,
  initialValue = 0,
  itemWidth = 50,
  ...props 
}: NumberScrollProps) => {
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const scrollViewRef = useRef<ScrollView>(null);
  const numbers = Array.from({ length: maxValue - minValue + 1 }, (_, i) => i + minValue);
  const visibleItems = 7; // Show 7 items in total
  const padding = (visibleItems - 1) / 2 * itemWidth; // Equal padding on both sides

  useEffect(() => {
    if (scrollViewRef.current) {  
      const initialIndex = numbers.indexOf(initialValue);
      if (initialIndex !== -1) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: initialIndex * itemWidth,
            animated: false,
          });
        }, 100);
      }
    }
  }, []);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / itemWidth);
    const value = numbers[index] || minValue;
    
    if (value !== selectedValue) {
      setSelectedValue(value);
      handleChangeText(value);
    }
  };

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / itemWidth);
    
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * itemWidth,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.miniLabel}>How often do you want to track?</Text>

      <View style={[styles.scrollContainer, { width: visibleItems * itemWidth }]}> 
        <View style={[styles.scrollHighlight, { width: itemWidth }]} />
        
        <ScrollView
          ref={scrollViewRef}
          horizontal
          style={styles.scrollView}
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: padding,
          }}
          {...props}
        >
          {numbers.map((num) => (
            <TouchableOpacity
            key={num}
            onPress={() => {
              const index = numbers.indexOf(num);
              scrollViewRef.current?.scrollTo({
                x: index * itemWidth,
                animated: true,
              });
              setSelectedValue(num);
              handleChangeText(num);
            }}
            style={[styles.scrollItem, { width: itemWidth }]}
          >
            <Text 
              style={[styles.numberText, num === selectedValue && styles.selectedText]}
            >
              {num}
            </Text>
          </TouchableOpacity>
          
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default NumberInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 1,
    paddingLeft: 2,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '200',
    marginBottom: 5,
    paddingLeft: 2,
  },
  scrollContainer: {
    height: 60,
    borderRadius: 5,
    borderColor: "#E6F0FF",
    marginTop: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 1,
    borderWidth:.1,
    borderRadius:5
  },
  scrollView: {
    flex: 1,
  },
  scrollItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 18,
    color: '#7B7B8B',
    fontFamily: 'Inter-SemiBold',
  },
  selectedText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
});
