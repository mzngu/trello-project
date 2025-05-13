import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BoardDetailScreen from '../../src/screens/BoardDetailScreen';
import { BoardService, ListService } from '../../src/services/api';
import { ThemeProvider } from '../../src/context/ThemeContext';

// Mock navigation and route
const mockNavigate = jest.fn();
const mockRoute = {
  params: {
    boardId: 'test-board-123',
    boardName: 'Test Board',
    workspaceId: 'test-workspace-456'
  }
};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));

// Mock services
jest.mock('../../src/services/api', () => ({
  BoardService: {
    getBoardLists: jest.fn(),
    updateBoard: jest.fn(),
    deleteBoard: jest.fn(),
  },
  ListService: {
    getListCards: jest.fn(),
    createList: jest.fn(),
  },
  CardService: {
    createCard: jest.fn(),
  }
}));

describe('BoardDetailScreen', () => {
  const mockLists = [
    {
      id: 'list-1',
      name: 'To Do',
      cards: [
        { id: 'card-1', name: 'Task 1' },
        { id: 'card-2', name: 'Task 2' }
      ]
    },
    {
      id: 'list-2',
      name: 'Doing',
      cards: []
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (BoardService.getBoardLists as jest.Mock).mockResolvedValue(mockLists);
    (ListService.getListCards as jest.Mock).mockImplementation((listId) => {
      const list = mockLists.find(l => l.id === listId);
      return Promise.resolve(list?.cards || []);
    });
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <BoardDetailScreen />
      </ThemeProvider>
    );
  };

  it('renders board name', async () => {
    const { findByText } = renderComponent();

    const boardName = await findByText('Test Board');
    expect(boardName).toBeTruthy();
  });

  it('displays lists and cards', async () => {
    const { findByText } = renderComponent();

    // Wait for lists to load
    await waitFor(() => {
      expect(BoardService.getBoardLists).toHaveBeenCalledWith('test-board-123');
    });

    // Check list names
    const toDoList = await findByText('To Do');
    const doingList = await findByText('Doing');
    expect(toDoList).toBeTruthy();
    expect(doingList).toBeTruthy();

    // Check card names
    const task1 = await findByText('Task 1');
    const task2 = await findByText('Task 2');
    expect(task1).toBeTruthy();
    expect(task2).toBeTruthy();
  });

  it('opens new list modal', async () => {
    const { getByText, findByPlaceholderText } = renderComponent();

    // Find and press "Ajouter une liste"
    const addListButton = getByText('+ Ajouter une liste');
    fireEvent.press(addListButton);

    // Check if modal is open
    const listNameInput = await findByPlaceholderText('Nom de la liste');
    expect(listNameInput).toBeTruthy();
  });

  it('creates a new list', async () => {
    (ListService.createList as jest.Mock).mockResolvedValue({
      id: 'new-list-123',
      name: 'New List'
    });

    const { getByText, getByPlaceholderText } = renderComponent();

    // Open new list modal
    const addListButton = getByText('+ Ajouter une liste');
    fireEvent.press(addListButton);

    // Enter list name
    const listNameInput = getByPlaceholderText('Nom de la liste');
    fireEvent.changeText(listNameInput, 'New List');

    // Confirm list creation
    const createButton = getByText('Créer');
    fireEvent.press(createButton);

    // Wait for list creation
    await waitFor(() => {
      expect(ListService.createList).toHaveBeenCalledWith({
        name: 'New List',
        boardId: 'test-board-123'
      });
    });
  });
});