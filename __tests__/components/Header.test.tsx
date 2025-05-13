import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Header from '../../src/components/Header';
import { ThemeProvider } from '../../src/context/ThemeContext';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack
  }),
}));

describe('Header Component', () => {
  const defaultProps = {
    title: 'Test Title',
    showBackButton: false,
    showMenu: false
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider>
        <Header {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  it('renders title correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText('Test Title')).toBeTruthy();
  });

  it('shows back button when showBackButton is true', () => {
    const mockOnBackPress = jest.fn();
    const { getByText } = renderComponent({
      showBackButton: true,
      onBackPress: mockOnBackPress
    });

    const backButton = getByText('←');
    expect(backButton).toBeTruthy();

    fireEvent.press(backButton);
    expect(mockOnBackPress).toHaveBeenCalled();
  });

  it('shows menu button when showMenu is true', () => {
    const { getByText } = renderComponent({ showMenu: true });

    // Assuming menu button is represented by '☰'
    const menuButton = getByText('☰');
    expect(menuButton).toBeTruthy();
  });
});