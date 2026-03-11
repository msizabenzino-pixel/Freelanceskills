import * as LocalAuthentication from 'expo-local-authentication';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useBiometrics = () => {
  const [isCompatible, setIsCompatible] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsCompatible(compatible);
      
      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error('Biometrics support check failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async (reason: string = 'Authenticate to continue') => {
    if (!isCompatible || !isEnrolled) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Enter Password',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed', error);
      Alert.alert('Authentication Error', 'Could not complete biometric authentication');
      return false;
    }
  };

  return {
    isCompatible,
    isEnrolled,
    isLoading,
    authenticate,
  };
};
