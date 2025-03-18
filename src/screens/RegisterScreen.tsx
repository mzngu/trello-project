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
import colors from '../styles/color';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Here you would typically validate inputs and register the user
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    // For this example, we'll just navigate to the Home screen
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PRISM</Text>
        <View style={styles.arrowContainer}>
          <TouchableOpacity style={styles.arrowButton}>
            <Text style={styles.arrowText}>➔</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>BIENVENUE À PRISM</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderText}>Inscription</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>E-mail :</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Entrez votre email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe :</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Choisissez un mot de passe"
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmer le mot de passe :</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmez le mot de passe"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleRegister}
          >
            <Text style={styles.actionButtonText}>S'inscrire</Text>
          </TouchableOpacity>
          
          <View style={styles.switchFormContainer}>
            <Text style={styles.switchFormText}>
              Déjà un compte ?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchFormLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  arrowContainer: {
    width: 30,
  },
  arrowButton: {
    padding: 5,
  },
  arrowText: {
    fontSize: 18,
    color: '#1565c0',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 5,
    padding: 15,
    marginTop: 10,
  },
  formHeader: {
    backgroundColor: colors.accent,
    padding: 10,
    marginBottom: 15,
  },
  formHeaderText: {
    color: colors.textLight,
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 3,
    padding: 10,
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: colors.buttonPrimary,
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  switchFormContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  switchFormText: {
    fontSize: 12,
    marginRight: 5,
  },
  switchFormLink: {
    fontSize: 12,
    color: '#1565c0',
  },
});

export default RegisterScreen;