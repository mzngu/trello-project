import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TrelloAuthProvider } from './src/context/TrelloAuthContext';
import AppNavigation from './src/navigation/AppNavigation';
import { Platform, StatusBar } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import defaultColors from './src/styles/color';

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        {Platform.OS !== 'web' && (
          <StatusBar 
            backgroundColor={defaultColors.header} 
            barStyle="dark-content" 
          />
        )}
        <TrelloAuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </TrelloAuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}