import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import Header from '../components/Header';
import colors from '../styles/color';

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;

const MenuScreen = () => {
  const navigation = useNavigation<MenuScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Menu" showBack={true} />
      
      <View style={styles.content}>
        <ScrollView style={styles.menuScrollView}>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemDot}>•••••••••</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.menuItemText}>Accueil</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.menuItem}>
            <Text style={styles.menuItemDot}>•••••••••</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.menuItemText}>Paramètres</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.bottomButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.bottomButtonText}>Accéder au TABLEAU</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 15,
    backgroundColor: '#795548', // Brown background for menu
  },
  menuScrollView: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  menuItemDot: {
    color: 'white',
    marginRight: 10,
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
  },
  tableItem: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 3,
  },
  tableText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomButton: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default MenuScreen;