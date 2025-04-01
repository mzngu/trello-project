import trelloClient from './trelloApi';

const ListService = {
  // Get a specific list by ID
  getList: async (listId) => {
    try {
      const response = await trelloClient.get(`/lists/${listId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching list ${listId}:`, error);
      throw error;
    }
  },

  // Create a new list
  createList: async (listData) => {
    try {
      const response = await trelloClient.post('/lists', {
        name: listData.name,
        idBoard: listData.boardId,
        pos: listData.position || 'bottom',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  },

  // Update a list
  updateList: async (listId, listData) => {
    try {
      const response = await trelloClient.put(`/lists/${listId}`, {
        name: listData.name,
        pos: listData.position,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating list ${listId}:`, error);
      throw error;
    }
  },

  // Archive a list (Trello doesn't allow permanent deletion of lists)
  archiveList: async (listId) => {
    try {
      const response = await trelloClient.put(`/lists/${listId}/closed`, {
        value: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Error archiving list ${listId}:`, error);
      throw error;
    }
  },
  
  // Restore an archived list
  restoreList: async (listId) => {
    try {
      const response = await trelloClient.put(`/lists/${listId}/closed`, {
        value: false,
      });
      return response.data;
    } catch (error) {
      console.error(`Error restoring list ${listId}:`, error);
      throw error;
    }
  },
  
  // Move a list to a different board
  moveList: async (listId, boardId) => {
    try {
      const response = await trelloClient.put(`/lists/${listId}/idBoard`, {
        value: boardId,
      });
      return response.data;
    } catch (error) {
      console.error(`Error moving list ${listId} to board ${boardId}:`, error);
      throw error;
    }
  },
  
  // Get all cards in a list
  getListCards: async (listId) => {
    try {
      const response = await trelloClient.get(`/lists/${listId}/cards`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cards for list ${listId}:`, error);
      throw error;
    }
  },
};

export default ListService;