import BoardService from '../../src/services/api/boardService';
import trelloClient from '../../src/services/api/trelloApi';

// Mock axios
jest.mock('../../src/services/api/trelloApi', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('BoardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBoards', () => {
    it('should fetch boards successfully', async () => {
      const mockBoards = [
        { id: 'board1', name: 'Project Board' },
        { id: 'board2', name: 'Personal Board' }
      ];

      (trelloClient.get as jest.Mock).mockResolvedValue({ data: mockBoards });

      const result = await BoardService.getBoards();

      expect(trelloClient.get).toHaveBeenCalledWith('/members/me/boards');
      expect(result).toEqual(mockBoards);
    });
  });

  describe('createBoard', () => {
    it('should create a board successfully', async () => {
      const boardData = {
        name: 'New Project',
        description: 'Project Description',
        workspaceId: 'workspace123'
      };

      const mockCreatedBoard = {
        id: 'newBoard123',
        ...boardData
      };

      (trelloClient.post as jest.Mock).mockResolvedValue({ data: mockCreatedBoard });

      const result = await BoardService.createBoard(boardData);

      expect(trelloClient.post).toHaveBeenCalledWith('/boards', {
        name: boardData.name,
        desc: boardData.description,
        defaultLists: false,
        idOrganization: boardData.workspaceId
      });
      expect(result).toEqual(mockCreatedBoard);
    });

    it('should create a board with Kanban template', async () => {
      const boardData = {
        name: 'Kanban Board',
        template: 'kanban'
      };

      const mockCreatedBoard = {
        id: 'kanbanBoard123',
        name: boardData.name
      };

      (trelloClient.post as jest.Mock).mockResolvedValue({ data: mockCreatedBoard });

      const result = await BoardService.createBoard(boardData);

      expect(trelloClient.post).toHaveBeenCalledWith('/boards', {
        name: boardData.name,
        desc: '',
        defaultLists: true,
        idOrganization: ''
      });
      expect(result).toEqual(mockCreatedBoard);
    });
  });

  describe('updateBoard', () => {
    it('should update a board successfully', async () => {
      const boardId = 'board123';
      const updateData = {
        name: 'Updated Board Name',
        description: 'Updated Description'
      };

      const mockUpdatedBoard = {
        id: boardId,
        ...updateData
      };

      (trelloClient.put as jest.Mock).mockResolvedValue({ data: mockUpdatedBoard });

      const result = await BoardService.updateBoard(boardId, updateData);

      expect(trelloClient.put).toHaveBeenCalledWith(`/boards/${boardId}`, {
        name: updateData.name,
        desc: updateData.description
      });
      expect(result).toEqual(mockUpdatedBoard);
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board successfully', async () => {
      const boardId = 'board123';

      (trelloClient.delete as jest.Mock).mockResolvedValue({});

      await BoardService.deleteBoard(boardId);

      expect(trelloClient.delete).toHaveBeenCalledWith(`/boards/${boardId}`);
    });
  });
});