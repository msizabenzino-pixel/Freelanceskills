import { useCallback } from 'react';
import { trackEvent, trackScreenView, trackApply, trackPremiumPurchase } from '../services/analytics';

export const useAnalytics = () => {
  const logScreen = useCallback((screenName: string) => {
    trackScreenView(screenName);
  }, []);

  const logApply = useCallback((jobId: string) => {
    trackApply(jobId);
  }, []);

  const logPurchase = useCallback((planId: string) => {
    trackPremiumPurchase(planId);
  }, []);

  const logCustomEvent = useCallback((name: any, properties?: Record<string, any>) => {
    trackEvent({ name, properties });
  }, []);

  return {
    logScreen,
    logApply,
    logPurchase,
    logCustomEvent,
  };
};
