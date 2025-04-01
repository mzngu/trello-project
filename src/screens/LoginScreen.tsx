import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useTrelloAuthContext } from '../context/TrelloAuthContext';
import colors from '../styles/color';
import globalStyles from '../styles/globalStyles';

const API_KEY = '';
const API_TOKEN = '';

const REDIRECT_URL = 'trelltech://auth/callback';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [apiKey, setApiKey] = useState(API_KEY || '');
  const [apiToken, setApiToken] = useState(API_TOKEN || '');
  const [isManualTokenEntry, setIsManualTokenEntry] = useState(!API_KEY || !API_TOKEN);

  const { isLoading, error, loginWithCredentials, loginWithOAuth, handleOAuthCallback } = useTrelloAuthContext();

  // Handle deep linking for OAuth callback
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (url.includes('trelltech://auth/callback')) {
        // Handle OAuth callback
        await handleOAuthCallback(url, apiKey);
        navigation.navigate('Home');
      }
    };

    // Add event listener for deep links
    Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url && url.includes('trelltech://auth/callback')) {
        handleOAuthCallback(url, apiKey);
        navigation.navigate('Home');
      }
    });

    // Clean up
    return () => {
      // Remove event listener (updated for newer React Native versions)
      Linking.removeAllListeners('url');
    };
  }, [apiKey, handleOAuthCallback, navigation]);

  const handleManualLogin = async () => {
    if (!apiKey || !apiToken) {
      Alert.alert('Erreur', 'Veuillez entrer la clé API et le token');
      return;
    }

    const success = await loginWithCredentials(apiKey, apiToken);
    if (success) {
      navigation.navigate('Home');
    }
  };

  const handleOAuthLogin = async () => {
    try {
      await loginWithOAuth(apiKey, REDIRECT_URL);
      // Navigation will happen after OAuth callback is received
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'autorisation Trello');
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
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
          
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          {isManualTokenEntry ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Clé API Trello :</Text>
                <TextInput
                  style={styles.input}
                  value={API_KEY}
                  onChangeText={setApiKey}
                  placeholder="Entrez votre clé API Trello"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Token API Trello :</Text>
                <TextInput
                  style={styles.input}
                  value={API_TOKEN}
                  onChangeText={setApiToken}
                  placeholder="Entrez votre token API Trello"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleManualLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textLight} />
                ) : (
                  <Text style={styles.actionButtonText}>Se connecter</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => setIsManualTokenEntry(false)}
              >
                <Text style={styles.secondaryButtonText}>Revenir en arrière</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Connectez-vous avec votre compte Trello pour accéder à vos tableaux et espaces de travail.
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleOAuthLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textLight} />
                ) : (
                  <Text style={styles.actionButtonText}>Se connecter avec Trello</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.formHeader}
                onPress={() => setIsManualTokenEntry(true)}
              >
             <Text style={styles.formHeaderText}>Connexion à Trello manuellement</Text>
             </TouchableOpacity>

            </>
          )}
          
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Besoin d'une clé API et d'un token ? 
              <Text style={styles.helpLink} onPress={() => Linking.openURL('https://trello.com/app-key')}>
                {' '}Comment je fais ?
              </Text>
            </Text>
          </View>
          
          <View style={styles.switchFormContainer}>
            <Text style={styles.switchFormText}>
              Nouveau sur PRISM ?
            </Text>
            <TouchableOpacity onPress={goToRegister}>
              <Text style={styles.switchFormLink}>Se créer un compte</Text>
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
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.text,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: colors.buttonPrimary,
    padding: 12,
    borderRadius: 3,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontSize: 14,
  },
  helpContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  helpText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  helpLink: {
    color: colors.accent,
    textDecorationLine: 'underline',
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

export default LoginScreen;


          