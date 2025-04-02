import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.trello.com/1';
let API_KEY = '';
let API_TOKEN = '';

export const TrelloAuth = {
  // Save API credentials
  saveCredentials: async (apiKey, apiToken) => {
    try {
      await AsyncStorage.setItem('@trello_api_key', apiKey);
      await AsyncStorage.setItem('@trello_api_token', apiToken);
      API_KEY = apiKey;
      API_TOKEN = apiToken;
      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  },

  // Clear credentials (logout)
  clearCredentials: async () => {
    try {
      await AsyncStorage.removeItem('@trello_api_key');
      await AsyncStorage.removeItem('@trello_api_token');
      API_KEY = '';
      API_TOKEN = '';
      return true;
    } catch (error) {
      console.error('Error clearing credentials:', error);
      throw error;
    }
  },

  // Check if credentials are valid
  hasValidCredentials: async () => {
    try {
      const apiKey = await AsyncStorage.getItem('@trello_api_key');
      const apiToken = await AsyncStorage.getItem('@trello_api_token');
      
      if (!apiKey || !apiToken) return false;

      // Validate by making a test API call
      const response = await axios.get(`${API_BASE_URL}/members/me`, {
        params: { key: apiKey, token: apiToken }
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  // Validate credentials
  validateCredentials: async (apiKey, apiToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/members/me`, {
        params: { key: apiKey, token: apiToken }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Credential validation error:', error);
      return false;
    }
  }
};

// Create axios instance with interceptor
const trelloClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth params
trelloClient.interceptors.request.use(async (config) => {
  const apiKey = await AsyncStorage.getItem('@trello_api_key');
  const apiToken = await AsyncStorage.getItem('@trello_api_token');

  config.params = {
    ...config.params,
    key: apiKey,
    token: apiToken,
  };

  return config;
});

export default trelloClient;