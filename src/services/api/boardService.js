import trelloClient from './trelloApi';

const BoardService = {
  // Get all boards for current user
  getBoards: async () => {
    try {
      const response = await trelloClient.get('/members/me/boards');
      return response.data;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  },

  // Get a specific board by ID
  getBoard: async (boardId) => {
    try {
      const response = await trelloClient.get(`/boards/${boardId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching board ${boardId}:`, error);
      throw error;
    }
  },

  // Create a new board
  createBoard: async (boardData) => {
    try {
      const params = {
        name: boardData.name,
        desc: boardData.description || '',
        defaultLists: boardData.defaultLists || false,
        idOrganization: boardData.workspaceId || '',
      };
      
      // Handle templates
      if (boardData.template && boardData.template.toLowerCase() === 'kanban') {
        params.defaultLists = true;
      }
      
      const response = await trelloClient.post('/boards', params);
      
      if (boardData.template && !params.defaultLists) {
        await createTemplateListsForBoard(response.data.id, boardData.template);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  },

  // Update a board
  updateBoard: async (boardId, boardData) => {
    try {
      const response = await trelloClient.put(`/boards/${boardId}`, {
        name: boardData.name,
        desc: boardData.description,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating board ${boardId}:`, error);
      throw error;
    }
  },

  // Delete a board
  deleteBoard: async (boardId) => {
    try {
      const response = await trelloClient.delete(`/boards/${boardId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting board ${boardId}:`, error);
      throw error;
    }
  },
  
  // Get all lists on a board
  getBoardLists: async (boardId) => {
    try {
      const response = await trelloClient.get(`/boards/${boardId}/lists`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lists for board ${boardId}:`, error);
      throw error;
    }
  },
  
  // Get all cards on a board
  getBoardCards: async (boardId) => {
    try {
      const response = await trelloClient.get(`/boards/${boardId}/cards`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cards for board ${boardId}:`, error);
      throw error;
    }
  },
  
  // Get all members of a board
  getBoardMembers: async (boardId) => {
    try {
      const response = await trelloClient.get(`/boards/${boardId}/members`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching members for board ${boardId}:`, error);
      throw error;
    }
  },
};

// Helper function to create template lists for a board
const createTemplateListsForBoard = async (boardId, templateName) => {
  try {
    const templates = {
      kanban: ['To Do', 'Doing', 'Done'],
      sprint: ['Backlog', 'Sprint Planning', 'In Progress', 'Review', 'Done'],
      project: ['Ideas', 'Planning', 'In Progress', 'Testing', 'Completed'],
    };
    
    const listsToCreate = templates[templateName.toLowerCase()] || templates.kanban;
    
    // Create each list for the template
    for (let i = 0; i < listsToCreate.length; i++) {
      await trelloClient.post('/lists', {
        name: listsToCreate[i],
        idBoard: boardId,
        pos: i * 1000,
      });
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating template lists for board ${boardId}:`, error);
    throw error;
  }
};

export default BoardService;