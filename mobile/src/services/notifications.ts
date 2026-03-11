import * as Notifications from 'expo-notifications';

export const NotificationService = {
  scheduleLocalNotification: async (title: string, body: string, data?: any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // deliver immediately
    });
  },

  setBadgeCount: async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  },

  dismissAll: async () => {
    await Notifications.dismissAllNotificationsAsync();
  }
};
