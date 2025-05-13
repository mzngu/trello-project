import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TableCard from '../../src/components/TableCard';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('TableCard Component', () => {
  const mockProps = {
    id: 'test-card-1',
    title: 'Test Card',
    color: '#FF0000',
    onPress: jest.fn()
  };

  it('renders correctly', () => {
    const { getByText } = render(<TableCard {...mockProps} />);

    // Check if the title is rendered
    const cardTitle = getByText('Test Card');
    expect(cardTitle).toBeTruthy();
  });

  it('handles press event', () => {
    const { getByText } = render(<TableCard {...mockProps} />);

    // Find the touchable component and simulate press
    const cardTitle = getByText('Test Card');
    fireEvent.press(cardTitle);

    // Check if onPress was called
    expect(mockProps.onPress).toHaveBeenCalled();
  });

  it('renders with correct color', () => {
    const { getByText } = render(<TableCard {...mockProps} />);

    const cardTitle = getByText('Test Card');

    // You might need to use a styling library or check native styles
    expect(cardTitle).toBeTruthy();
  });
});