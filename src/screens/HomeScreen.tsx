import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import Header from '../components/Header';
import colors from '../styles/color';
import globalStyles from '../styles/globalStyles';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="TABLEAUX" showMenu={true} />
      
      <View style={styles.content}>
        <Text style={styles.contentTitle}>Espace de travail</Text>
        
        <View style={styles.tableList}>
          <TouchableOpacity 
            style={[styles.tableItem, { backgroundColor: colors.tableRed }]}
            onPress={() => navigation.navigate('Order', { tableId: '1', tableName: 'TABLEAU 1' })}
          >
            <Text style={styles.tableText}>TABLEAU 1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tableItem, { backgroundColor: colors.tablePurple }]}
            onPress={() => navigation.navigate('Order', { tableId: '2', tableName: 'TABLEAU 2' })}
          >
            <Text style={styles.tableText}>TABLEAU 2</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.bottomButton}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.bottomButtonText}>Accéder au MENU</Text>
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
  },
  contentTitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  tableList: {
    marginTop: 10,
  },
  tableItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 3,
  },
  tableText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  bottomButton: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  bottomButtonText: {
    color: colors.textLight,
    fontSize: 12,
  },
});

export default HomeScreen;