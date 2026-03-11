// Placeholder for a real analytics service like Segment or Firebase
// For now, we'll log to console or a simple backend endpoint

type EventName = 
  | 'screen_view'
  | 'job_apply'
  | 'premium_purchase'
  | 'login'
  | 'search';

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, any>;
}

export const trackEvent = (event: AnalyticsEvent) => {
  console.log('[Analytics]', event.name, event.properties);
  // In a real app, you would send this to your analytics provider
};

export const trackScreenView = (screenName: string) => {
  trackEvent({
    name: 'screen_view',
    properties: { screen_name: screenName },
  });
};

export const trackApply = (jobId: string) => {
  trackEvent({
    name: 'job_apply',
    properties: { job_id: jobId },
  });
};

export const trackPremiumPurchase = (planId: string) => {
  trackEvent({
    name: 'premium_purchase',
    properties: { plan_id: planId },
  });
};
