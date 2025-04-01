import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base Trello API configuration
const API_BASE_URL = 'https://api.trello.com/1';
let API_KEY = '';
let API_TOKEN = '';

// Initialize API keys from storage
const initializeApiCredentials = async () => {
  try {
    API_KEY = await AsyncStorage.getItem('@trello_api_key');
    API_TOKEN = await AsyncStorage.getItem('@trello_api_token');
    return { API_KEY, API_TOKEN };
  } catch (error) {
    console.error('Error initializing API credentials:', error);
    throw error;
  }
};

// Save API credentials
const saveApiCredentials = async (apiKey, apiToken) => {
  try {
    await AsyncStorage.setItem('@trello_api_key', apiKey);
    await AsyncStorage.setItem('@trello_api_token', apiToken);
    API_KEY = apiKey;
    API_TOKEN = apiToken;
    return true;
  } catch (error) {
    console.error('Error saving API credentials:', error);
    throw error;
  }
};

// Clear API credentials (for logout)
const clearApiCredentials = async () => {
  try {
    await AsyncStorage.removeItem('@trello_api_key');
    await AsyncStorage.removeItem('@trello_api_token');
    API_KEY = '';
    API_TOKEN = '';
    return true;
  } catch (error) {
    console.error('Error clearing API credentials:', error);
    throw error;
  }
};

// Create axios instance with auth params
const trelloClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth params to every request
trelloClient.interceptors.request.use(async (config) => {
  // Make sure credentials are initialized
  if (!API_KEY || !API_TOKEN) {
    await initializeApiCredentials();
  }
  
  // Add auth params to request
  config.params = {
    ...config.params,
    key: API_KEY,
    token: API_TOKEN,
  };
  
  return config;
});

// Authentication functions
const TrelloAuth = {
  saveCredentials: saveApiCredentials,
  clearCredentials: clearApiCredentials,
  hasValidCredentials: async () => {
    const { API_KEY, API_TOKEN } = await initializeApiCredentials();
    return !!(API_KEY && API_TOKEN);
  },
  validateCredentials: async (apiKey, apiToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/members/me`, {
        params: { key: apiKey, token: apiToken }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }
};

export { TrelloAuth, initializeApiCredentials };
export default trelloClient;