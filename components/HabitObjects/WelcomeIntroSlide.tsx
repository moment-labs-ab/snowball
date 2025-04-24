import { View, Text,Animated, Easing, StyleSheet  } from 'react-native'
import { useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';


const WelcomeIntroSlide = () => {

    const swipeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(swipeAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(swipeAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, []);
  return (
    <View key="slide1" style={[styles.bodyContainer, { position: 'relative' }]}>
  <Text style={styles.body}>
    Welcome to <Text style={styles.highlight}>Snowball.</Text> We're glad you're here.
  </Text>

  {/* Swipe Indicator */}
  <Animated.View
  style={{
    position: 'absolute',
    bottom: 20,
    right: 20,
    opacity: swipeAnim,
    flexDirection: 'row',
    alignItems: 'center',
    transform: [
      {
        translateX: swipeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  }}
>
  <MaterialIcons name="arrow-left" size={24} color="black" />
  <Text style={{  fontSize: 14, color: 'black' }}>Swipe!</Text>
</Animated.View>

</View>

  )
}

export default WelcomeIntroSlide;

const styles = StyleSheet.create({

bodyContainer: {
    paddingHorizontal: 20,
    justifyContent: "center",
    alignContent:'center',
    height: "90%",
  },
  body: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "300",
  },
  highlight: {
    color: "#8BBDFA",
    fontWeight: "600",
  },
})