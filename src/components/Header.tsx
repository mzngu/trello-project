import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useTheme, createThemedStyles } from '../context/ThemeContext';

// Définition des propriétés de l'en tête
type HeaderProps = {
  title: string;
  showMenu?: boolean; // optionnelle
  showBack?: boolean; // optionnelle
  rightText?: string;  // optionnelle
  onBackPress?: () => void; // suivant le showBack
};

const Header: React.FC<HeaderProps> = ({ 
  //propriéts par défaut
  title, 
  showMenu = false, 
  showBack = false,
  rightText = 'PRISM',
  onBackPress
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const styles = useHeaderStyles();

  const handleMenuPress = () => {
    if (showMenu) {
      navigation.navigate('Menu');
    } else if (showBack) {
      if (onBackPress) {
        onBackPress();
      } else {
        navigation.goBack();
      }
    }
  };

  const logoSource = require('../assets/logoPrism.png') 
  
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {(showMenu || showBack) && (
          <TouchableOpacity onPress={handleMenuPress}>
            <Text style={styles.menuIcon}>{showMenu ? '☰' : '←'}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightContainer}>
        <Image 
          source={logoSource} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

// On utilise createThemedStyles pour creer un style dynamic
const useHeaderStyles = createThemedStyles(colors => StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: colors.header,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    width: 30,
  },
  menuIcon: {
    fontSize: 22,
    color: colors.textLight,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: colors.textLight,
  },
  rightContainer: {
    width: 50,
  },
  rightText: {
    fontSize: 12,
    color: colors.textLight, 
  },
  logo: {
    width: 45,
    height: 45,
  },
}));

export default Header;