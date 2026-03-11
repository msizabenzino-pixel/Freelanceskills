import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const SOCKET_URL = 'wss://freelanceskills.net';

export const connectSocket = async () => {
  const token = await SecureStore.getItemAsync('user_session');
  
  const socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket'],
  });

  return socket;
};
