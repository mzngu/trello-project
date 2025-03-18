import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import colors from '../styles/color';

type HeaderProps = {
  title: string;
  showMenu?: boolean;
  showBack?: boolean;
  rightText?: string;
};

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showMenu = false, 
  showBack = false,
  rightText = 'PRISM'
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleMenuPress = () => {
    if (showMenu) {
      navigation.navigate('Menu');
    } else if (showBack) {
      navigation.goBack();
    }
  };

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
        <Text style={styles.rightText}>{rightText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  rightContainer: {
    width: 50,
  },
  rightText: {
    fontSize: 12,
    color: '#1565c0',
  },
});

export default Header;