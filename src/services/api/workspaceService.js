import trelloClient from './trelloApi';

// In Trello API, "organizations" are equivalent to "workspaces"
const WorkspaceService = {
  // Get all workspaces
  getWorkspaces: async () => {
    try {
      const response = await trelloClient.get('/members/me/organizations');
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  },

  // Get a specific workspace by ID
  getWorkspace: async (workspaceId) => {
    try {
      const response = await trelloClient.get(`/organizations/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workspace ${workspaceId}:`, error);
      throw error;
    }
  },

  // Create a new workspace
  createWorkspace: async (workspaceData) => {
    try {
      const response = await trelloClient.post('/organizations', {
        displayName: workspaceData.displayName,
        desc: workspaceData.description || '',
        name: workspaceData.name || workspaceData.displayName.toLowerCase().replace(/\s/g, '_'),
        website: workspaceData.website || '',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },

  // Update a workspace
  updateWorkspace: async (workspaceId, workspaceData) => {
    try {
      const response = await trelloClient.put(`/organizations/${workspaceId}`, {
        displayName: workspaceData.displayName,
        desc: workspaceData.description,
        name: workspaceData.name,
        website: workspaceData.website,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating workspace ${workspaceId}:`, error);
      throw error;
    }
  },

  // Delete a workspace
  deleteWorkspace: async (workspaceId) => {
    try {
      const response = await trelloClient.delete(`/organizations/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting workspace ${workspaceId}:`, error);
      throw error;
    }
  },

  // Get all members of a workspace
  getWorkspaceMembers: async (workspaceId) => {
    try {
      const response = await trelloClient.get(`/organizations/${workspaceId}/members`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching members of workspace ${workspaceId}:`, error);
      throw error;
    }
  },

  // Get all boards in a workspace
  getWorkspaceBoards: async (workspaceId) => {
    try {
      const response = await trelloClient.get(`/organizations/${workspaceId}/boards`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching boards in workspace ${workspaceId}:`, error);
      throw error;
    }
  },
};

export default WorkspaceService;