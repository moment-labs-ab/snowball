import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";

interface LoadingSkeletonProps {
  style?: ViewStyle;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ style }) => {
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.container, style, { opacity: opacityAnim }]} />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#8BBDFA",
    borderRadius: 15,
    minHeight: 62,
    justifyContent: "center",
    borderWidth: 0.9,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
    flex: 1,
  },
});

export default LoadingSkeleton;
