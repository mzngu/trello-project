import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultColors from '../styles/color';

interface ThemeColors {
  primary: string;
  background: string;
  text: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  setPrimaryColor: () => {}
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

  useEffect(() => {
    const loadSavedColor = async () => {
      try {
        const savedColor = await AsyncStorage.getItem('primaryColor');
        if (savedColor) {
          updateThemeWithPrimaryColor(savedColor);
        }
      } catch (error) {
        console.error('Failed to load saved color', error);
      }
    };

    loadSavedColor();
  }, []);

  const updateThemeWithPrimaryColor = (primaryColor: string) => {
    setColors({
      ...colors,
      primary: primaryColor,
      // You can derive other colors from the primary if needed
      // For example, a darker version for buttons
      buttonPrimary: primaryColor, // Or use a function to darken this color
    });
  };

  // Function to change the primary color
  const setPrimaryColor = async (color: string) => {
    try {
      await AsyncStorage.setItem('primaryColor', color);
      updateThemeWithPrimaryColor(color);
    } catch (error) {
      console.error('Failed to save color', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;