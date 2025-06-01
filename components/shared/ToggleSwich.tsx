import React, { useEffect, useState } from 'react';
import { View, Text, Switch, ActivityIndicator, StyleSheet } from 'react-native';

type ToggleSwitchProps = {
  initialValue: boolean;
  onToggleOn: () => Promise<void>;
  onToggleOff: () => Promise<void>;
  label?: string;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ initialValue, onToggleOn, onToggleOff, label }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(initialValue);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleSwitch = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    setLoading(true);

    try {
      if (newValue) {
        await onToggleOn();
      } else {
        await onToggleOff();
      }
    } catch (error) {
      console.error('Toggle action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Switch
          value={isEnabled}
          onValueChange={toggleSwitch}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 16,
  },
});

export default ToggleSwitch;