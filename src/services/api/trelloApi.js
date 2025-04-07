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
      console.log('Credentials saved successfully');
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

  // Get stored credentials
  getCredentials: async () => {
    try {
      const apiKey = await AsyncStorage.getItem('@trello_api_key');
      const apiToken = await AsyncStorage.getItem('@trello_api_token');
      return { apiKey, apiToken };
    } catch (error) {
      console.error('Error getting credentials:', error);
      return { apiKey: null, apiToken: null };
    }
  },

  // Check if credentials are valid
  hasValidCredentials: async () => {
    try {
      const apiKey = await AsyncStorage.getItem('@trello_api_key');
      const apiToken = await AsyncStorage.getItem('@trello_api_token');
      
      if (!apiKey || !apiToken) return false;
      
      // Update the global variables
      API_KEY = apiKey;
      API_TOKEN = apiToken;
      
      // Validate by making a test API call
      const response = await axios.get(`${API_BASE_URL}/members/me`, {
        params: { key: apiKey, token: apiToken }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Credentials validation failed:', error);
      return false;
    }
  },

  // Validate credentials
  validateCredentials: async (apiKey, apiToken) => {
    try {
      console.log('Validating credentials...');
      const response = await axios.get(`${API_BASE_URL}/members/me`, {
        params: { key: apiKey, token: apiToken }
      });
      console.log('Validation response status:', response.status);
      return response.status === 200;
    } catch (error) {
      console.error('Credential validation error:', error);
      console.error('Error details:', error.response?.data || 'No response data');
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
  try {
    const apiKey = await AsyncStorage.getItem('@trello_api_key');
    const apiToken = await AsyncStorage.getItem('@trello_api_token');
    
    // Log request details for debugging (remove in production)
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    config.params = {
      ...config.params,
      key: apiKey,
      token: apiToken,
    };
    
    return config;
  } catch (error) {
    console.error('Error in request interceptor:', error);
    return config;
  }
});

// Response interceptor for better error handling
trelloClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        endpoint: error.config.url,
        method: error.config.method?.toUpperCase(),
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// API functions for boards
export const TrelloBoards = {
  // Get all boards
  getBoards: async () => {
    try {
      const response = await trelloClient.get('/members/me/boards');
      return response.data;
    } catch (error) {
      console.error('Error getting boards:', error);
      throw error;
    }
  },
  
  // Create a new board
  createBoard: async (name, description = '', defaultLists = true) => {
    try {
      console.log(`Creating board: ${name}`);
      const response = await trelloClient.post('/boards', null, {
        params: {
          name,
          desc: description,
          defaultLists,
          pos: 'top'
        }
      });
      console.log('Board created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating board:', error);
      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }
};

export default trelloClient;