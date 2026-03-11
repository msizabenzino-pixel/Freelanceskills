import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export const CalendarService = {
  requestPermissions: async () => {
    const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();
    const { status: remindersStatus } = Platform.OS === 'ios' 
      ? await Calendar.requestRemindersPermissionsAsync() 
      : { status: 'granted' };
      
    return calendarStatus === 'granted' && remindersStatus === 'granted';
  },

  createEvent: async (title: string, startDate: Date, endDate: Date, location?: string) => {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
    
    if (defaultCalendar) {
      await Calendar.createEventAsync(defaultCalendar.id, {
        title,
        startDate,
        endDate,
        location,
        timeZone: 'UTC',
      });
      return true;
    }
    return false;
  }
};
