import * as Sentry from '@sentry/react-native';

export const initCrashlytics = () => {
  Sentry.init({
    dsn: 'https://placeholder@sentry.io/placeholder',
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1.0,
  });
};

export const logError = (error: Error, context?: any) => {
  console.error(error, context);
  Sentry.captureException(error, { extra: context });
};

export const setUserContext = (user: { id: string; email: string }) => {
  Sentry.setUser(user);
};
