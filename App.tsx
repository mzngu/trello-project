import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TrelloAuthProvider } from './src/context/TrelloAuthContext';
import AppNavigation from './src/navigation/AppNavigation';
import { Platform } from 'react-native';

// Only import StatusBar if not on web platform
import { StatusBar } from 'react-native';
import colors from './src/styles/color';

export default function App() {
  return (
    <SafeAreaProvider>
      {Platform.OS !== 'web' && <StatusBar backgroundColor={colors.header} barStyle="dark-content" />}
      <TrelloAuthProvider>
        <NavigationContainer>
          <AppNavigation />
        </NavigationContainer>
      </TrelloAuthProvider>
    </SafeAreaProvider>
  );
}