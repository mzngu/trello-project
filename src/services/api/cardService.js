import trelloClient from './trelloApi';

const CardService = {
  // Get a specific card by ID
  getCard: async (cardId) => {
    try {
      const response = await trelloClient.get(`/cards/${cardId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching card ${cardId}:`, error);
      throw error;
    }
  },

  // Create a new card
  createCard: async (cardData) => {
    try {
      const response = await trelloClient.post('/cards', {
        name: cardData.name,
        desc: cardData.description || '',
        idList: cardData.listId,
        pos: cardData.position || 'bottom',
        due: cardData.dueDate || null,
        idMembers: cardData.memberIds || [],
        idLabels: cardData.labelIds || [],
      });
      return response.data;
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  },

  // Update a card
  updateCard: async (cardId, cardData) => {
    try {
      const updateData = {};
      
      // Only include fields that are actually being updated
      if (cardData.name !== undefined) updateData.name = cardData.name;
      if (cardData.description !== undefined) updateData.desc = cardData.description;
      if (cardData.listId !== undefined) updateData.idList = cardData.listId;
      if (cardData.position !== undefined) updateData.pos = cardData.position;
      if (cardData.dueDate !== undefined) updateData.due = cardData.dueDate;
      if (cardData.closed !== undefined) updateData.closed = cardData.closed;
      
      const response = await trelloClient.put(`/cards/${cardId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating card ${cardId}:`, error);
      throw error;
    }
  },

  // Delete a card
  deleteCard: async (cardId) => {
    try {
      const response = await trelloClient.delete(`/cards/${cardId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting card ${cardId}:`, error);
      throw error;
    }
  },
  
  // Card members functions
  
  // Get all members assigned to a card
  getCardMembers: async (cardId) => {
    try {
      const response = await trelloClient.get(`/cards/${cardId}/members`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching members for card ${cardId}:`, error);
      throw error;
    }
  },
  
  // Assign a member to a card
  assignMember: async (cardId, memberId) => {
    try {
      const response = await trelloClient.post(`/cards/${cardId}/idMembers`, {
        value: memberId,
      });
      return response.data;
    } catch (error) {
      console.error(`Error assigning member ${memberId} to card ${cardId}:`, error);
      throw error;
    }
  },
  
  // Remove a member from a card
  removeMember: async (cardId, memberId) => {
    try {
      const response = await trelloClient.delete(`/cards/${cardId}/idMembers/${memberId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing member ${memberId} from card ${cardId}:`, error);
      throw error;
    }
  },
  
  // Card comments/activity
  
  // Add a comment to a card
  addComment: async (cardId, commentText) => {
    try {
      const response = await trelloClient.post(`/cards/${cardId}/actions/comments`, {
        text: commentText,
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to card ${cardId}:`, error);
      throw error;
    }
  },
  
  // Get comments on a card
  getComments: async (cardId) => {
    try {
      const response = await trelloClient.get(`/cards/${cardId}/actions`, {
        params: {
          filter: 'commentCard',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for card ${cardId}:`, error);
      throw error;
    }
  },
  
  // Card attachments
  
  // Add an attachment to a card
  addAttachment: async (cardId, attachmentData) => {
    try {
      // For file uploads, we need to use FormData
      if (attachmentData.file) {
        const formData = new FormData();
        formData.append('file', attachmentData.file);
        formData.append('name', attachmentData.name || attachmentData.file.name);
        
        const response = await trelloClient.post(`/cards/${cardId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else if (attachmentData.url) {
        // For URL attachments
        const response = await trelloClient.post(`/cards/${cardId}/attachments`, {
          url: attachmentData.url,
          name: attachmentData.name || '',
        });
        return response.data;
      }
      
      throw new Error('Either file or url must be provided for attachment');
    } catch (error) {
      console.error(`Error adding attachment to card ${cardId}:`, error);
      throw error;
    }
  },
  
  // Get all attachments on a card
  getAttachments: async (cardId) => {
    try {
      const response = await trelloClient.get(`/cards/${cardId}/attachments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attachments for card ${cardId}:`, error);
      throw error;
    }
  },
};

export default CardService;