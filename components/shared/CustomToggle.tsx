import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  LayoutAnimation, 
  Platform, 
  UIManager,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Define the size options
export type SizeOption = 'small' | 'medium' | 'large';

// Define prop types with TypeScript
interface ToggleSwitchProps {
  options: [string, string]; // Tuple of exactly 2 strings
  value?: number; // 0 for first option, 1 for second option
  defaultValue?: number; // Default selected option (0 or 1)
  primaryColor?: string; // Main color for the active state
  secondaryColor?: string; // Color for the inactive state
  textColor?: string; // Color for the text
  activeTextColor?: string; // Color for active text (optional)
  size?: SizeOption; // Size of the toggle
  disabled?: boolean; // Whether the toggle is disabled
  onChange?: (selectedIndex: number) => void; // Callback when toggle changes
  style?: ViewStyle; // Container style
  textStyle?: TextStyle; // Style for the text
  testID?: string; // For testing
}

// Size configuration by option
const sizeConfig = {
  small: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 9,
    height: 24,
  },
  medium: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    fontSize: 14,
    height: 36,
  },
  large: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    fontSize: 16,
    height: 44,
  },
};

export const CustomToggle: React.FC<ToggleSwitchProps> = ({
  options,
  value,
  defaultValue = 0,
  primaryColor = '#2196F3',
  secondaryColor = '#f2f2f2',
  textColor = '#333',
  activeTextColor,
  size = 'medium',
  disabled = false,
  onChange,
  style,
  textStyle,
  testID,
}) => {
  // State for controlled or uncontrolled component
  const [selectedIndex, setSelectedIndex] = useState(value !== undefined ? value : defaultValue);
  
  // This will track if the component is controlled or not
  const isControlled = value !== undefined;
  
  // Get the current index from props if controlled, otherwise from state
  const currentIndex = isControlled ? value : selectedIndex;
  
  // Animation config
  const animationConfig = {
    duration: 200,
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  };

  // Handle toggle press
  const handleToggle = useCallback((index: number) => {
    if (disabled) return;
    // Don't do anything if the selected option is clicked again
    if (index === currentIndex) return;
    
    // Animate the transition
    LayoutAnimation.configureNext(animationConfig);
    
    // Update internal state if uncontrolled
    if (!isControlled) {
      setSelectedIndex(index);
    }
    
    // Call the onChange callback
    onChange?.(index);
  }, [isControlled, disabled, onChange]);

  // Get size configuration based on the size prop
  const currentSizeConfig = sizeConfig[size];

  // Memoize the styles to prevent unnecessary recalculations
  const dynamicStyles = useMemo(() => ({
    container: {
      height: currentSizeConfig.height,
      opacity: disabled ? 0.6 : 1,
    },
    option: {
      paddingVertical: currentSizeConfig.paddingVertical,
      paddingHorizontal: currentSizeConfig.paddingHorizontal,
    },
    text: {
      fontSize: currentSizeConfig.fontSize,
    },
    activeOption: {
      backgroundColor: primaryColor,
    },
    inactiveOption: {
      backgroundColor: secondaryColor,
    },
    activeText: {
      color: activeTextColor || '#fff',
    },
    inactiveText: {
      color: textColor,
    },
  }), [currentSizeConfig, disabled, primaryColor, secondaryColor, textColor, activeTextColor]);

  return (
    <View 
      style={[styles.container, dynamicStyles.container, style]}
      testID={testID}
    >
      {options.map((option, index) => (
        <TouchableOpacity
          key={option}
          activeOpacity={0.8}
          disabled={disabled}
          style={[
            styles.option,
            dynamicStyles.option,
            currentIndex === index ? dynamicStyles.activeOption : dynamicStyles.inactiveOption,
          ]}
          onPress={() => handleToggle(index)}
          testID={`${testID}-option-${index}`}
        >
          <Text
            style={[
              styles.text,
              dynamicStyles.text,
              currentIndex === index ? dynamicStyles.activeText : dynamicStyles.inactiveText,
              textStyle,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 999, // Very rounded corners
    overflow: 'hidden',
    alignSelf: 'flex-start', // Take only as much width as needed
  },
  option: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '500',
  },
});

export default CustomToggle;