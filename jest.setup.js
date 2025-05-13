// Définir explicitement __DEV__
global.__DEV__ = true;

// Mocks pour React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform.OS = 'web';
  return RN;
});

// Mock pour AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock pour react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    TouchableOpacity: View,
  };
});

// Mock pour react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Ignore some warnings
const { warn } = console;
console.warn = (...args) => {
  if (
    args[0]?.includes?.('Animated:') ||
    args[0]?.includes?.('Reanimated') ||
    args[0]?.includes?.('react-native-gesture-handler')
  ) {
    return;
  }
  warn(...args);
};