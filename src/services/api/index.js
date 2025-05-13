import trelloClient, { TrelloAuth, initializeApiCredentials } from './trelloApi';
import WorkspaceService from './workspaceService';
import BoardService from './boardService';
import ListService from './listService';
import CardService from './cardService';

// Export all API services
export {
  trelloClient,
  TrelloAuth,
  initializeApiCredentials,
  WorkspaceService,
  BoardService,
  ListService,
  CardService
};

// Export a utility function for handling API errors
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (error.response) {
    const statusCode = error.response.status;
    const errorData = error.response.data;
    
    if (statusCode === 401) {
      return {
        message: 'Authentication failed. Please log in again.',
        status: statusCode,
        isAuthError: true,
      };
    }
    
    return {
      message: errorData.message || `Error ${statusCode}: ${fallbackMessage}`,
      status: statusCode,
      data: errorData,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response from server. Please check your internet connection.',
      isNetworkError: true,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || fallbackMessage,
    };
  }
};