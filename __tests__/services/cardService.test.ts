import CardService from '../../src/services/api/cardService';
import trelloClient from '../../src/services/api/trelloApi';

// Mock axios
jest.mock('../../src/services/api/trelloApi', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('CardService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getCard', () => {
    it('should fetch a card successfully', async () => {
      const mockCard = {
        id: 'card123',
        name: 'Test Card',
        desc: 'Test Description'
      };

      (trelloClient.get as jest.Mock).mockResolvedValue({ data: mockCard });

      const result = await CardService.getCard('card123');

      expect(trelloClient.get).toHaveBeenCalledWith('/cards/card123');
      expect(result).toEqual(mockCard);
    });

    it('should handle errors when fetching a card', async () => {
      const errorMessage = 'Card not found';
      (trelloClient.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(CardService.getCard('invalidCard')).rejects.toThrow(errorMessage);
    });
  });

  describe('createCard', () => {
    it('should create a card successfully', async () => {
      const cardData = {
        name: 'New Card',
        description: 'Card Description',
        listId: 'list123'
      };

      const mockCreatedCard = {
        id: 'newCard123',
        ...cardData
      };

      (trelloClient.post as jest.Mock).mockResolvedValue({ data: mockCreatedCard });

      const result = await CardService.createCard(cardData);

      expect(trelloClient.post).toHaveBeenCalledWith('/cards', {
        name: 'New Card',
        desc: 'Card Description',
        idList: 'list123',
        pos: 'bottom',
        due: null,
        idMembers: [],
        idLabels: []
      });
      expect(result).toEqual(mockCreatedCard);
    });
  });

  describe('updateCard', () => {
    it('should update a card successfully', async () => {
      const cardId = 'card123';
      const updateData = {
        name: 'Updated Card Name',
        description: 'Updated Description'
      };

      const mockUpdatedCard = {
        id: cardId,
        ...updateData
      };

      (trelloClient.put as jest.Mock).mockResolvedValue({ data: mockUpdatedCard });

      const result = await CardService.updateCard(cardId, updateData);

      expect(trelloClient.put).toHaveBeenCalledWith(`/cards/${cardId}`, {
        name: 'Updated Card Name',
        desc: 'Updated Description'
      });
      expect(result).toEqual(mockUpdatedCard);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card successfully', async () => {
      const cardId = 'card123';

      (trelloClient.delete as jest.Mock).mockResolvedValue({});

      await CardService.deleteCard(cardId);

      expect(trelloClient.delete).toHaveBeenCalledWith(`/cards/${cardId}`);
    });
  });
});