import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import Header from '../components/Header';
import { useTheme, createThemedStyles } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const styles = useSettingsStyles();

  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedName = await AsyncStorage.getItem('user_name');
        const savedDateOfBirth = await AsyncStorage.getItem('user_dob');
        
        if (savedName) setName(savedName);
        if (savedDateOfBirth) setDateOfBirth(savedDateOfBirth);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('user_name', name);
      await AsyncStorage.setItem('user_dob', dateOfBirth);
      
      Alert.alert('Succès', 'Paramètres enregistrés');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer les paramètres');
      console.error('Error saving settings:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer votre compte ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'user_name',
                'user_dob',
              ]);
              
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error deleting account:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="PARAMÈTRES" 
        showBackButton={true} 
        onBackPress={() => navigation.goBack()}
        showMenu={true} 
      />
      
      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textPrimary }]}>PROFIL</Text>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Nom d'utilisateur :</Text>
            <TextInput
              style={[styles.settingsInput, { borderBottomColor: colors.secondary }]}
              value={name}
              onChangeText={setName}
              placeholder="Votre nom d'utilisateur"
              placeholderTextColor={colors.textSecondary} 
            />
          </View>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Date de naissance :</Text>
            <TextInput
              style={[styles.settingsInput, { borderBottomColor: colors.secondary }]}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.textSecondary} 
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textPrimary }]}>THÈME</Text>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Mode sombre/claire</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={isDarkMode ? colors.accent : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.settingsButtonsContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>ENREGISTRER</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: colors.buttonDanger }]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>SUPPRIMER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const useSettingsStyles = createThemedStyles(colors => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  settingsSection: {
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.textPrimary, // Ensure visibility
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsLabel: {
    width: 140,
    fontSize: 14,
    color: colors.textPrimary, // Ensure label is visible
  },
  settingsInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    paddingVertical: 5,
    fontSize: 14,
    color: colors.textPrimary, // Ensure input text is visible
  },
  settingsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 25,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginRight: 15,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}));
export default SettingsScreen;