import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTrelloAuthContext } from '../context/TrelloAuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import BoardDetailScreen from '../screens/BoardDetailScreen';
import CreateBoardScreen from '../screens/CreateBoardScreen';
import CreateWorkspaceScreen from '../screens/CreateWorkspaceScreen';
import CardDetailScreen from '../screens/CardDetailScreen';
import MenuScreen from '../screens/MenuScreen';
import colors from '../styles/color';
import OrderScreen from '../screens/OrderScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Define the param list for our stack navigator
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  BoardList: { workspaceId: string; workspaceName: string };
  BoardDetail: { boardId: string; boardName: string; workspaceId: string };
  CardDetail: { cardId: string; cardName: string; listId: string; boardId: string };
  CreateBoard: { workspaceId: string; workspaceName: string };
  EditBoard: { boardId: string; boardName: string; workspaceId: string };
  CreateWorkspace: undefined;
  Menu: undefined;
  Settings: undefined;
  Order: undefined;

};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  const { isAuthenticated, isLoading } = useTrelloAuthContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "Home" : "Login"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Always include all screens but control access via navigation events */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <Stack.Screen name="CreateBoard" component={CreateBoardScreen} />
      <Stack.Screen name="CreateWorkspace" component={CreateWorkspaceScreen} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      <Stack.Screen name="Order" component={OrderScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />



    </Stack.Navigator>
  );
};

export default AppNavigation;