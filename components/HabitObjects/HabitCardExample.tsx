import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from 'react-native'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width - 32 // account for marginHorizontal: 16

const HabitCardExample = () => {
    const [count, setCount] = useState(0)
  // Create a single animated value to control both animations
  const progress = useRef(new Animated.Value(0)).current
  
  // Derive both animations from the same progress value
  const overlayWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CARD_WIDTH]
  })
  
  const fingerX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CARD_WIDTH - 40]
  })

  useEffect(() => {
    const loopAnimation = () => {
        setCount(1)
      Animated.sequence([
        // Swipe right
        Animated.timing(progress, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Can't use native driver because overlayWidth needs JS
        }),
        Animated.delay(500),
        // Swipe left (reset)
        Animated.timing(progress, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(500),
      ]).start(() => loopAnimation())
      setCount(0)
    }

    loopAnimation()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Sliding color overlay */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: '#9ec8fb', // Your tracking color
              width: overlayWidth,
              zIndex: 0,
            },
          ]}
        />

        <View style={styles.cardContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>❄️</Text>
            <View style={{ paddingLeft: 5 }}>
              <Text style={styles.title}>Learn Snowball</Text>
              
            </View>
          </View>
        </View>
      </View>

      {/* Container for finger animation that has overflow hidden */}
      <View style={styles.fingerContainer}>
        {/* Finger Emoji */}
        <Animated.View
          style={[
            styles.finger,
            {
              transform: [{ translateX: fingerX }],
            },
          ]}
        >
          <Text style={{ fontSize: 28 }}>👆</Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 40, // Add space for the finger below
    overflow: 'hidden', // Important: prevent content from spilling out
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    height: 62,
    justifyContent: 'center',
    borderWidth: 0.9,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    flex: 1,
    zIndex: 1,
  },
  title: {
    color: 'black',
    fontWeight: '600',
    fontSize: 18,
  },
  subtitle: {
    color: '#525756',
    fontSize: 10,
    fontWeight: '200',
  },
  fingerContainer: {
    position: 'relative',
    height: 30,
    marginHorizontal: 16,
    overflow: 'hidden', // Crucial: this contains the finger within this view
  },
  finger: {
    position: 'absolute',
    bottom: 0,
    left: 0, // Start at the left edge
    height: 30,
  },
})

export default HabitCardExample