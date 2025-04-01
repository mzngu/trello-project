import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lightColors from '../styles/lightColors';
import darkColors from '../styles/darkColors';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  header: string;
  card: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger: string;
  buttonSuccess: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  tableRed: string;
  tablePurple: string;
  border: string;
  inputBackground: string;
  text: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  colors: lightColors,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(lightColors);

  // Load theme preference on initial render
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('app_theme_mode');
        if (savedThemeMode === 'dark') {
          setIsDarkMode(true);
          setColors(darkColors);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Toggle theme
  const toggleTheme = async () => {
    try {
      const newThemeMode = !isDarkMode;
      setIsDarkMode(newThemeMode);
      
      // Set colors based on mode
      const newColors = newThemeMode ? darkColors : lightColors;
      setColors(newColors);
      
      // Save theme preference
      await AsyncStorage.setItem('app_theme_mode', newThemeMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const createThemedStyles = <T,>(
  stylesCreator: (colors: ThemeColors) => T
) => {
  return () => {
    const { colors } = useTheme();
    return stylesCreator(colors);
  };
};

export default ThemeContext;