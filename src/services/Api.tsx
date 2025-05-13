import axios from 'axios';

const BASE_URL = 'https://api.trello.com/1';

const API_KEY = process.env.API_KEY;
const API_TOKEN = process.env.API_TOKEN;

const trelloApi = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
    token: API_TOKEN,
  },
});

export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  url: string;
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  idBoard: string;
  idList: string;
  due: string | null;
  labels: TrelloLabel[];
}

export interface TrelloLabel {
  id: string;
  name: string;
  color: string;
}

export interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
}

// Board operations
export const boardsApi = {
  /**
   * Get all boards for the authenticated user
   */
  getBoards: async (): Promise<TrelloBoard[]> => {
    const response = await trelloApi.get('/members/me/boards');
    return response.data;
  },

  /**
   * Get a specific board by ID
   */
  getBoard: async (boardId: string): Promise<TrelloBoard> => {
    const response = await trelloApi.get(`/boards/${boardId}`);
    return response.data;
  },

  /**
   * Create a new board
   */
  createBoard: async (name: string, desc: string = ''): Promise<TrelloBoard> => {
    const response = await trelloApi.post('/boards', {
      name,
      desc,
      defaultLists: true,  // Create default lists (To Do, Doing, Done)
    });
    return response.data;
  },

  /**
   * Update a board
   */
  updateBoard: async (boardId: string, updates: Partial<TrelloBoard>): Promise<TrelloBoard> => {
    const response = await trelloApi.put(`/boards/${boardId}`, updates);
    return response.data;
  },

  /**
   * Delete and close a board
   */
  deleteBoard: async (boardId: string): Promise<void> => {
    await trelloApi.put(`/boards/${boardId}`, { closed: true });
  },
};

// List operations
export const listsApi = {
  /**
   * Get all lists for a board
   */
  getLists: async (boardId: string): Promise<TrelloList[]> => {
    const response = await trelloApi.get(`/boards/${boardId}/lists`);
    return response.data;
  },

  /**
   * Create a new list on a board
   */
  createList: async (boardId: string, name: string): Promise<TrelloList> => {
    const response = await trelloApi.post('/lists', {
      idBoard: boardId,
      name,
    });
    return response.data;
  },

  /**
   * Update a list
   */
  updateList: async (listId: string, updates: Partial<TrelloList>): Promise<TrelloList> => {
    const response = await trelloApi.put(`/lists/${listId}`, updates);
    return response.data;
  },

  /**
   * Archive (close) a list
   */
  archiveList: async (listId: string): Promise<void> => {
    await trelloApi.put(`/lists/${listId}`, { closed: true });
  },
};

// Card operations
export const cardsApi = {
  /**
   * Get all cards for a list
   */
  getCards: async (listId: string): Promise<TrelloCard[]> => {
    const response = await trelloApi.get(`/lists/${listId}/cards`);
    return response.data;
  },

  /**
   * Get a specific card
   */
  getCard: async (cardId: string): Promise<TrelloCard> => {
    const response = await trelloApi.get(`/cards/${cardId}`);
    return response.data;
  },

  /**
   * Create a new card
   */
  createCard: async (listId: string, card: Partial<TrelloCard>): Promise<TrelloCard> => {
    const response = await trelloApi.post('/cards', {
      idList: listId,
      ...card,
    });
    return response.data;
  },

  /**
   * Update a card
   */
  updateCard: async (cardId: string, updates: Partial<TrelloCard>): Promise<TrelloCard> => {
    const response = await trelloApi.put(`/cards/${cardId}`, updates);
    return response.data;
  },

  /**
   * Move a card to a different list
   */
  moveCard: async (cardId: string, targetListId: string): Promise<TrelloCard> => {
    const response = await trelloApi.put(`/cards/${cardId}`, {
      idList: targetListId,
    });
    return response.data;
  },

  /**
   * Delete (archive) a card
   */
  deleteCard: async (cardId: string): Promise<void> => {
    await trelloApi.delete(`/cards/${cardId}`);
  },
};

// Members operations
export const membersApi = {
  /**
   * Get current member info
   */
  getCurrentMember: async (): Promise<TrelloMember> => {
    const response = await trelloApi.get('/members/me');
    return response.data;
  },

  /**
   * Get members of a board
   */
  getBoardMembers: async (boardId: string): Promise<TrelloMember[]> => {
    const response = await trelloApi.get(`/boards/${boardId}/members`);
    return response.data;
  },

  /**
   * Add a member to a board
   */
  addMemberToBoard: async (boardId: string, memberId: string): Promise<void> => {
    await trelloApi.put(`/boards/${boardId}/members/${memberId}`);
  },

  /**
   * Add a member to a card
   */
  addMemberToCard: async (cardId: string, memberId: string): Promise<void> => {
    await trelloApi.post(`/cards/${cardId}/idMembers`, {
      value: memberId,
    });
  },
};

// Search operations
export const searchApi = {
  /**
   * Search Trello for boards, cards, etc.
   */
  search: async (query: string): Promise<any> => {
    const response = await trelloApi.get('/search', {
      params: {
        query,
        modelTypes: 'all',
      },
    });
    return response.data;
  },
};

// Error handler helper function
export const handleApiError = (error: any): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return `Error ${error.response.status}: ${error.response.data.message || 'Unknown error'}`;
  } else if (error.request) {
    // The request was made but no response was received
    return 'Network error: No response from server';
  } else {
    // Something happened in setting up the request
    return `Error: ${error.message}`;
  }
};

// Export a default object with all APIs
const api = {
  boards: boardsApi,
  lists: listsApi,
  cards: cardsApi,
  members: membersApi,
  search: searchApi,
};

export default api;