import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface MetricTooltipData {
  title: string;
  value: string | number;
  description: string;
  calculation?: string;
}

interface TooltipProps {
  isVisible: boolean;
  targetRef: React.RefObject<any>;
  onHide: () => void;
  data: MetricTooltipData;
  tooltipStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Tooltip: React.FC<TooltipProps> = ({
  isVisible,
  targetRef,
  onHide,
  data,
  tooltipStyle,
  textStyle,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      fadeIn();
    } else {
      fadeOut();
    }
  }, [isVisible]);

  const updatePosition = () => {
    if (targetRef.current) {
      targetRef.current.measure(
        (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
          // Adjust position to center the tooltip if possible
          setPosition({
            x: Math.max(10, pageX - 100), // Keep tooltip at least 10px from left edge
            y: pageY + height + 5,
          });
        }
      );
    }
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} onRequestClose={onHide}>
      <TouchableWithoutFeedback onPress={onHide}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.tooltip,
              tooltipStyle,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                }],
                left: position.x,
                top: position.y,
              },
            ]}
          >
            <View style={styles.arrow} />
            <View style={styles.contentContainer}>
              <Text style={[styles.titleText, textStyle]}>{data.title}</Text>
              <Text style={[styles.valueText, textStyle]}>{data.value}</Text>
              <Text style={[styles.descriptionText, textStyle]}>{data.description}</Text>
              {data.calculation && (
                <Text style={[styles.calculationText, textStyle]}>
                  Calculation: {data.calculation}
                </Text>
              )}
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    gap: 8,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  valueText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  descriptionText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  calculationText: {
    color: '#ccc',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  arrow: {
    position: 'absolute',
    top: -10,
    left: 20,
    borderWidth: 5,
    borderColor: 'transparent',
    borderBottomColor: '#333',
  },
});

export default Tooltip;