import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CardDetailScreen from '../../src/screens/CardDetailScreen';
import { CardService, BoardService } from '../../src/services/api';
import { ThemeProvider } from '../../src/context/ThemeContext';

// Mock navigation and route
const mockGoBack = jest.fn();
const mockRoute = {
  params: {
    cardId: 'test-card-123',
    cardName: 'Test Card',
    listId: 'test-list-456',
    boardId: 'test-board-789'
  }
};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

// Mock services
jest.mock('../../src/services/api', () => ({
  CardService: {
    getCard: jest.fn(),
    getComments: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
    addComment: jest.fn(),
    assignMember: jest.fn(),
    removeMember: jest.fn(),
  },
  BoardService: {
    getBoardMembers: jest.fn(),
  }
}));

describe('CardDetailScreen', () => {
  const mockCardData = {
    id: 'test-card-123',
    name: 'Test Card',
    desc: 'Test Description',
    idList: 'test-list-456',
    idMembers: [],
    members: []
  };

  const mockComments = [
    {
      id: 'comment-1',
      data: { text: 'First comment' },
      date: '2023-01-01T00:00:00Z',
      memberCreator: {
        fullName: 'John Doe',
        username: 'johndoe'
      }
    }
  ];

  const mockBoardMembers = [
    {
      id: 'member-1',
      fullName: 'Jane Smith',
      username: 'janesmith'
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (CardService.getCard as jest.Mock).mockResolvedValue(mockCardData);
    (CardService.getComments as jest.Mock).mockResolvedValue(mockComments);
    (BoardService.getBoardMembers as jest.Mock).mockResolvedValue(mockBoardMembers);
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <CardDetailScreen />
      </ThemeProvider>
    );
  };

  it('renders card details', async () => {
    const { findByText } = renderComponent();

    // Wait for card details to load
    await waitFor(() => {
      expect(CardService.getCard).toHaveBeenCalledWith('test-card-123');
    });

    // Check card name and description
    const cardName = await findByText('Test Card');
    const cardDescription = await findByText('Test Description');
    expect(cardName).toBeTruthy();
    expect(cardDescription).toBeTruthy();
  });

  it('displays comments', async () => {
    const { findByText } = renderComponent();

    // Wait for comments to load
    await waitFor(() => {
      expect(CardService.getComments).toHaveBeenCalledWith('test-card-123');
    });

    // Check comment content
    const commentText = await findByText('First comment');
    const commentAuthor = await findByText('John Doe');
    expect(commentText).toBeTruthy();
    expect(commentAuthor).toBeTruthy();
  });

  it('allows adding a comment', async () => {
    (CardService.addComment as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText } = renderComponent();

    // Wait for screen to load
    await waitFor(() => {
      expect(CardService.getCard).toHaveBeenCalled();
    });

    // Find comment input and add button
    const commentInput = getByPlaceholderText('Ajouter un commentaire...');
    const addCommentButton = getByText('Ajouter');

    // Enter comment
    fireEvent.changeText(commentInput, 'New test comment');

    // Press add comment button
    fireEvent.press(addCommentButton);

    // Wait for comment to be added
    await waitFor(() => {
      expect(CardService.addComment).toHaveBeenCalledWith('test-card-123', 'New test comment');
    });
  });

  it('allows editing card details', async () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    // Wait for card to load
    await waitFor(() => {
      expect(CardService.getCard).toHaveBeenCalled();
    });

    // Press edit button
    const editButton = getByText('Modifier');
    fireEvent.press(editButton);

    // Change card name and description
    const nameInput = getByPlaceholderText('Titre de la carte');
    const descInput = getByPlaceholderText('Description (optionnelle)');

    fireEvent.changeText(nameInput, 'Updated Card Name');
    fireEvent.changeText(descInput, 'Updated Description');

    // Save changes
    const saveButton = getByText('Enregistrer');
    fireEvent.press(saveButton);

    // Wait for update
    await waitFor(() => {
      expect(CardService.updateCard).toHaveBeenCalledWith('test-card-123', {
        name: 'Updated Card Name',
        description: 'Updated Description'
      });
    });
  });

  it('allows deleting a card', async () => {
    (CardService.deleteCard as jest.Mock).mockResolvedValue({});

    const { getByText } = renderComponent();

    // Wait for card to load
    await waitFor(() => {
      expect(CardService.getCard).toHaveBeenCalled();
    });

    // Press delete button
    const deleteButton = getByText('Supprimer');
    fireEvent.press(deleteButton);

    // Confirm deletion
    const confirmDeleteButton = getByText('Supprimer');
    fireEvent.press(confirmDeleteButton);

    // Wait for deletion
    await waitFor(() => {
      expect(CardService.deleteCard).toHaveBeenCalledWith('test-card-123');
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('shows members management modal', async () => {
    const { getByText } = renderComponent();

    // Wait for card and members to load
    await waitFor(() => {
      expect(BoardService.getBoardMembers).toHaveBeenCalledWith('test-board-789');
    });

    // Open members management
    const manageButton = getByText('Gérer');
    fireEvent.press(manageButton);

    // Check if modal is open and members are displayed
    const memberName = await waitFor(() => getByText('Jane Smith'));
    expect(memberName).toBeTruthy();
  });

  it('assigns and removes members', async () => {
    (CardService.assignMember as jest.Mock).mockResolvedValue({});
    (CardService.removeMember as jest.Mock).mockResolvedValue({});

    const { getByText } = renderComponent();

    // Wait for members to load
    await waitFor(() => {
      expect(BoardService.getBoardMembers).toHaveBeenCalledWith('test-board-789');
    });

    // Open members management
    const manageButton = getByText('Gérer');
    fireEvent.press(manageButton);

    // Find and press member to assign
    const memberName = getByText('Jane Smith');
    fireEvent.press(memberName);

    // Wait for member assignment/removal
    await waitFor(() => {
      expect(CardService.assignMember).toHaveBeenCalledWith('test-card-123', 'member-1');
    });
  });
});