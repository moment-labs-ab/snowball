import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 2.8;
const MIN_TIME_BETWEEN_SHAKES = 1000;

const useShakeDetection = () => {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [lastShake, setLastShake] = useState(0);
  const [isShaken, setIsShaken] = useState(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      setData({ x, y, z });

      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const currentTime = Date.now();

      if (acceleration > SHAKE_THRESHOLD && 
          currentTime - lastShake > MIN_TIME_BETWEEN_SHAKES) {
        setIsShaken(true);
        setLastShake(currentTime);
        
        // Reset the shake state after 2 seconds
        setTimeout(() => {
          setIsShaken(false);
        }, 2000);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [lastShake]);

  return { isShaken, x, y, z };
};

export default useShakeDetection;