import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import Header from '../components/Header';
import colors from '../styles/color';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleSave = () => {
    
    Alert.alert('Succès', 'Paramètres enregistrés avec succès');
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
          onPress: () => {
            
            navigation.navigate('Login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="SETTINGS" showMenu={true} />
      
      <View style={styles.content}>
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>PROFIL</Text>
          
          <View style={styles.settingsItem}>
            <Text style={styles.settingsLabel}>Nom :</Text>
            <TextInput
              style={styles.settingsInput}
              value={name}
              onChangeText={setName}
              placeholder="Entrez votre nom"
            />
          </View>
          
          <View style={styles.settingsItem}>
            <Text style={styles.settingsLabel}>Prénom :</Text>
            <TextInput
              style={styles.settingsInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Entrez votre prénom"
            />
          </View>
          
          <View style={styles.settingsItem}>
            <Text style={styles.settingsLabel}>Date de naissance :</Text>
            <TextInput
              style={styles.settingsInput}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="JJ/MM/AAAA"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Private Infos</Text>
          
          <View style={styles.settingsItem}>
            <Text style={styles.settingsLabel}>E-mail :</Text>
            <Text style={styles.settingsValue}>user@gmail.com</Text>
          </View>
          
          <View style={styles.settingsItem}>
            <Text style={styles.settingsLabel}>Mot de passe :</Text>
            <Text style={styles.settingsValue}>••••••••</Text>
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Général</Text>
          
          <View style={styles.settingsItem}>
            <Text style={styles.settingsLabel}>Default color</Text>
            <View style={[styles.colorSquare, { backgroundColor: '#81d4fa' }]} />
          </View>
        </View>
        
        <View style={styles.settingsButtonsContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>DELETE</Text>
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
  settingsSection: {
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsLabel: {
    width: 120,
    fontSize: 14,
  },
  settingsInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#90a4ae',
    paddingVertical: 3,
    fontSize: 14,
  },
  settingsValue: {
    flex: 1,
    fontSize: 14,
  },
  colorSquare: {
    width: 20,
    height: 20,
  },
  settingsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: colors.buttonDanger,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export default SettingsScreen;