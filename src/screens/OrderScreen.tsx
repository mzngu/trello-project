import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import Header from '../components/Header';
import colors from '../styles/color';

type OrderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Order'>;
type OrderScreenRouteProp = RouteProp<RootStackParamList, 'Order'>;

const OrderScreen = () => {
  const navigation = useNavigation<OrderScreenNavigationProp>();
  const route = useRoute<OrderScreenRouteProp>();
  
  // Extract tableId and tableName from route params, provide defaults if not available
  const { tableId = '1', tableName = 'TABLEAU 1' } = route.params || {};
  
  // Determine the color based on tableId
  const tableColor = tableId === '1' ? colors.tableRed : colors.tablePurple;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="TABLEAU" showBack={true} />
      
      <View style={styles.content}>
        <Text style={styles.contentTitle}>Espace de travail</Text>
        
        <View style={styles.orderContainer}>
          <View style={styles.orderItem}>
            <View style={[styles.orderColorBlock, { backgroundColor: tableColor }]} />
            <Text style={styles.orderText}>{tableName}</Text>
          </View>
          
          {/* This is where you would add the content specific to this table/order */}
          <View style={styles.orderContent}>
            <Text style={styles.orderContentText}>
              Contenu de {tableName}
            </Text>
            <Text style={styles.orderContentDescription}>
              Cette section contiendrait le contenu spécifique à ce tableau, 
              comme des listes de tâches, des notes, ou d'autres éléments
              selon les besoins de votre application.
            </Text>
          </View>
        </View>
        
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.bottomButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.bottomButtonText}>Retour au TABLEAU</Text>
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
  orderContainer: {
    marginTop: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderColorBlock: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  orderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderContent: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  orderContentText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderContentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
    color: 'white',
    fontSize: 12,
  },
});

export default OrderScreen;