import React, { useEffect, useRef } from 'react';
import { useColorScheme, Platform, LogBox } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { Home, Briefcase, MessageSquare, User, GraduationCap } from 'lucide-react-native';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { lightTheme, darkTheme } from './src/theme';
import { initCrashlytics } from './src/services/crashlytics';

import HomeScreen from './src/screens/HomeScreen';
import JobsScreen from './src/screens/JobsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AcademyScreen from './src/screens/AcademyScreen';
import LoginScreen from './src/screens/LoginScreen';
import JobDetailScreen from './src/screens/JobDetailScreen';
import JobApplyScreen from './src/screens/JobApplyScreen';
import ChatScreen from './src/screens/ChatScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import CameraScreen from './src/screens/CameraScreen';
import CourseViewerScreen from './src/screens/CourseViewerScreen';

LogBox.ignoreLogs(['Setting a timer']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

initCrashlytics();

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  JobDetail: { jobId: number };
  JobApply: { jobId: number; jobTitle: string };
  Chat: { conversationId: number; participantName: string };
  Premium: undefined;
  Camera: { mode: 'id-verification' | 'portfolio' };
  CourseViewer: { courseId: number; courseTitle: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const prefix = Linking.createURL('/');

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'freelanceskills://', 'https://freelanceskills.net'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Jobs: 'jobs',
          Messages: 'messages',
          Profile: 'profile',
          Academy: 'academy',
        },
      },
      JobDetail: 'job/:jobId',
      JobApply: 'job/:jobId/apply',
      Chat: 'chat/:conversationId',
      Premium: 'premium',
      CourseViewer: 'course/:courseId',
      Login: 'login',
    },
  },
};

const MainTabs = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'light' ? lightTheme : darkTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home size={size} color={color} />;
          if (route.name === 'Jobs') return <Briefcase size={size} color={color} />;
          if (route.name === 'Messages') return <MessageSquare size={size} color={color} />;
          if (route.name === 'Academy') return <GraduationCap size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
          return null;
        },
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 84 : 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        headerStyle: { backgroundColor: theme.colors.card },
        headerTitleStyle: { color: theme.colors.text, fontWeight: '700' as const },
        headerTintColor: theme.colors.text,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Jobs" component={JobsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Academy" component={AcademyScreen} options={{ title: 'Academy' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'light' ? lightTheme : darkTheme;
  const navigationRef = useRef<any>(null);
  const notificationResponseRef = useRef<any>(null);

  useEffect(() => {
    notificationResponseRef.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.jobId && navigationRef.current) {
        navigationRef.current.navigate('JobDetail', { jobId: data.jobId });
      }
      if (data?.conversationId && navigationRef.current) {
        navigationRef.current.navigate('Chat', {
          conversationId: data.conversationId,
          participantName: data.participantName || 'Chat',
        });
      }
    });

    return () => {
      if (notificationResponseRef.current) {
        Notifications.removeNotificationSubscription(notificationResponseRef.current);
      }
    };
  }, []);

  if (isLoading) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ headerShown: true, title: 'Job Details', headerStyle: { backgroundColor: theme.colors.card }, headerTintColor: theme.colors.text }} />
            <Stack.Screen name="JobApply" component={JobApplyScreen} options={{ headerShown: true, title: 'Apply', headerStyle: { backgroundColor: theme.colors.card }, headerTintColor: theme.colors.text }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Premium" component={PremiumScreen} options={{ headerShown: true, title: 'Go Premium', headerStyle: { backgroundColor: theme.colors.card }, headerTintColor: theme.colors.text }} />
            <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="CourseViewer" component={CourseViewerScreen} options={{ headerShown: true, title: 'Course', headerStyle: { backgroundColor: theme.colors.card }, headerTintColor: theme.colors.text }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <Navigation />
    </AuthProvider>
  );
}
