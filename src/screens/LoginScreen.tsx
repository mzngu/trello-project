import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { TrelloAuth } from '../services/api/trelloApi';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

const TRELLO_CLIENT_ID = 'd1ba10f27d1053f59aced0c0f52a7534';
const REDIRECT_URI = 'prismapp://auth/callback';
const TRELLO_AUTH_URL = `https://trello.com/1/authorize?expiration=1day&name=PrismApp&scope=read,write&response_type=token&key=${TRELLO_CLIENT_ID}&return_url=${encodeURIComponent(REDIRECT_URI)}`;

const LoginScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const { isLandscape } = useResponsive();

  // Dynamic styles based on orientation
  const getStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      flexDirection: isLandscape ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      width: isLandscape ? '50%' : '80%',
      padding: 20,
    },
    title: {
      fontSize: 20,
      textAlign: 'center',
      color: colors.textPrimary,
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: colors.buttonPrimary,
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
    },
    loginButtonText: {
      fontSize: 16,
      color: colors.textLight,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    }
  });

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const isAuthenticated = await TrelloAuth.hasValidCredentials();
        if (isAuthenticated) {
          navigation.replace('Home');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    // Setup deep link listener
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url.startsWith(REDIRECT_URI)) {
        // Extract token from fragment or query param
        let token;
        if (url.includes('#token=')) {
          token = url.split('#token=')[1];
        } else if (url.includes('?token=')) {
          token = url.split('?token=')[1];
        } else if (url.includes('token=')) {
          token = url.split('token=')[1];
        }
        
        if (token) {
          handleTrelloCallback(token);
        } else {
          console.error('No token found in URL:', url);
          Alert.alert('Erreur', 'Impossible de récupérer le token d\'authentification');
        }
      }
    };

    // Add event listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check initial URL (in case app was opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url && url.startsWith(REDIRECT_URI)) {
        let token;
        if (url.includes('#token=')) {
          token = url.split('#token=')[1];
        } else if (url.includes('?token=')) {
          token = url.split('?token=')[1];
        } else if (url.includes('token=')) {
          token = url.split('token=')[1];
        }
        
        if (token) {
          handleTrelloCallback(token);
        }
      }
    });

    checkAuth();

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  const handleTrelloCallback = async (token: string) => {
    try {
      // Log the token for debugging (remove in production)
      console.log('Token received:', token);
      
      // Validate and save credentials
      const isValid = await TrelloAuth.validateCredentials(TRELLO_CLIENT_ID, token);
      
      if (isValid) {
        await TrelloAuth.saveCredentials(TRELLO_CLIENT_ID, token);
        navigation.replace('Home');
      } else {
        // Handle invalid credentials
        Alert.alert('Erreur', 'Connexion échouée');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setShowWebView(false);
    }
  };

  const handleLoginWithTrello = () => {
    setShowWebView(true);
  };

  // Get dynamic styles
  const styles = getStyles();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (showWebView) {
    return (
      <WebView
        source={{ uri: TRELLO_AUTH_URL }}
        style={{ flex: 1 }}
        onNavigationStateChange={(navState) => {
          // Check if redirected to your callback URL
          if (navState.url.startsWith(REDIRECT_URI)) {
            let token;
            if (navState.url.includes('#token=')) {
              token = navState.url.split('#token=')[1];
            } else if (navState.url.includes('?token=')) {
              token = navState.url.split('?token=')[1];
            } else if (navState.url.includes('token=')) {
              token = navState.url.split('token=')[1];
            }
            
            if (token) {
              handleTrelloCallback(token);
            } else {
              console.error('No token found in URL:', navState.url);
            }
          }
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Connectez-vous à Trello
        </Text>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLoginWithTrello}
        >
          <Text style={styles.loginButtonText}>
            Se connecter avec Trello
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;