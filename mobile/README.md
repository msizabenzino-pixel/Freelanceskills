# FreelanceSkills Mobile App

This is the mobile app skeleton for FreelanceSkills, built with React Native and Expo.

## Prerequisites

- Node.js (LTS)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator / Physical Device with Expo Go app

## Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

- `App.tsx`: Main entry point with navigation setup.
- `src/api`: API client and Socket.io configuration.
- `src/hooks`: Custom React hooks (e.g., `useAuth`).
- `src/screens`: App screens (Home, Jobs, Messages, Profile, Login).
- `src/theme.ts`: UI theme configuration.
- `src/types.ts`: TypeScript interfaces.

## Authentication

The app uses `expo-secure-store` to persist authentication tokens. It connects to the same backend API as the web application.

## Real-time Features

Real-time messaging is powered by `socket.io-client`, connecting to the central FreelanceSkills WebSocket server.
