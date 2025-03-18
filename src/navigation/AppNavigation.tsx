import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import LoginScreen from '../screens/LoginScreen.tsx';
import RegisterScreen from '../screens/RegisterScreen.tsx';
import HomeScreen from '../screens/HomeScreen.tsx';
import MenuScreen from '../screens/MenuScreen.tsx';
import SettingsScreen from '../screens/SettingsScreen.tsx';
import OrderScreen from '../screens/OrderScreen.tsx';

// Define the types for our stack navigator
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Menu: undefined;
  Settings: undefined;
  Order: {
    tableId?: string;
    tableName?: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#b3e5fc' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Order" component={OrderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;