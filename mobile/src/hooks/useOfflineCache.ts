import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useOfflineCache = <T>(key: string, initialData?: T) => {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    loadCachedData();

    return () => unsubscribe();
  }, []);

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(`offline_cache_${key}`);
      if (cached) {
        setData(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Failed to load offline cache', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async (newData: T) => {
    try {
      setData(newData);
      await AsyncStorage.setItem(`offline_cache_${key}`, JSON.stringify(newData));
    } catch (error) {
      console.error('Failed to update offline cache', error);
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(`offline_cache_${key}`);
      setData(undefined);
    } catch (error) {
      console.error('Failed to clear offline cache', error);
    }
  };

  return {
    data,
    isOffline,
    isLoading,
    updateData,
    clearCache,
  };
};
