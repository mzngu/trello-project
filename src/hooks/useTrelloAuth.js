import { useState, useEffect, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import { TrelloAuth } from '../services/api';

const useTrelloAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check si l'utilisateur est déjà co
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const hasCredentials = await TrelloAuth.hasValidCredentials();
        setIsAuthenticated(hasCredentials);
        setError(null);
      } catch (error) {
        setError('Failed to check authentication status');
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // fonction pour mettre l'API key et le  token manuellement
  const loginWithCredentials = useCallback(async (apiKey, apiToken) => {
    try {
      setIsLoading(true);
      const isValid = await TrelloAuth.validateCredentials(apiKey, apiToken);
      
      if (isValid) {
        await TrelloAuth.saveCredentials(apiKey, apiToken);
        setIsAuthenticated(true);
        setError(null);
        return true;
      } else {
        setError('Invalid API key or token');
        return false;
      }
    } catch (error) {
      setError('Login failed: ' + error.message);
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // const loginWithOAuth = useCallback(async (apiKey, redirectUrl, scope = 'read,write') => {
  //   try {
  //     setIsLoading(true);
      
  //     // Construct the Trello authorization URL
  //     const authUrl = `https://trello.com/1/authorize?expiration=never&name=TrellTech&scope=${scope}&response_type=token&key=${apiKey}&return_url=${encodeURIComponent(redirectUrl)}`;
      
  //     // Open the URL in the browser
  //     await Linking.openURL(authUrl);
      
  //     // The user will be redirected back to the app with the token
  //     // This part should be handled by a deep link in your app
      
  //     // Note: You'll need to set up deep linking in your app to handle the redirect
  //     // and extract the token from the URL parameters
      
  //     return true;
  //   } catch (error) {
  //     setError('OAuth login failed: ' + error.message);
  //     console.error('OAuth error:', error);
  //     return false;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);
  
  // This should be called when your app receives the deep link
  // const handleOAuthCallback = useCallback(async (url, apiKey) => {
  //   try {
  //     setIsLoading(true);
      
  //     // Extract token from URL
  //     const token = url.split('token=')[1]?.split('&')[0];
      
  //     if (!token) {
  //       setError('No token found in callback URL');
  //       return false;
  //     }
      
  //     // valide et enregistre les credentials
  //     return await loginWithCredentials(apiKey, token);
  //   } catch (error) {
  //     setError('OAuth callback handling failed: ' + error.message);
  //     console.error('OAuth callback error:', error);
  //     return false;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [loginWithCredentials]);
  
  //Fonction pour se deconnecter
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await TrelloAuth.clearCredentials();
      setIsAuthenticated(false);
      setError(null);
      return true;
    } catch (error) {
      setError('Logout failed: ' + error.message);
      console.error('Logout error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    isAuthenticated,
    isLoading,
    error,
    loginWithCredentials,
    // loginWithOAuth,
    // handleOAuthCallback,
    logout,
  };
};

export default useTrelloAuth;