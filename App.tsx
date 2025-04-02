import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TrelloAuthProvider } from './src/context/TrelloAuthContext';
import AppNavigation from './src/navigation/AppNavigation';
import { Platform, StatusBar } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import defaultColors from './src/styles/color';
import { enableScreens } from 'react-native-screens';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function App() {

  useEffect(() => {
    // Allow all orientations
    ScreenOrientation.unlockAsync();
    
    return () => {
      // Optional: Lock back to portrait when app closes
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);
  
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