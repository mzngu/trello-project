import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import Header from '../components/Header';
import { useTheme, createThemedStyles } from '../context/ThemeContext';
import { WorkspaceService, BoardService, handleApiError } from '../services/api';
import { useTrelloAuthContext } from '../context/TrelloAuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Interface for workspace data
interface Workspace {
  id: string;
  name: string;
  displayName: string;
}

// Interface for board data
interface Board {
  id: string;
  name: string;
  prefs?: {
    backgroundColor?: string;
  };
}

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { logout } = useTrelloAuthContext();
  const { colors } = useTheme();
  const styles = useHomeStyles();
  
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load username from AsyncStorage
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('user_name');
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error('Error loading username:', error);
      }
    };
    
    loadUsername();
  }, []);

  // Fetch all boards
  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all boards across all workspaces
      const boardsData = await BoardService.getBoards();
      
      // Filter out closed (archived) boards
      const activeBoards = boardsData.filter((board: Board) => !board.closed);
      setBoards(activeBoards);
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to load boards');
      
      if (errorInfo.isAuthError) {
        Alert.alert('Session Expired', 'Please login again.', [
          { 
            text: 'OK', 
            onPress: async () => {
              await logout();
              navigation.replace('Login');
            }
          }
        ]);
      } else {
        setError(errorInfo.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on initial render
  useEffect(() => {
    fetchBoards();
  }, []);

  // Refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBoards();
    }, [])
  );

  // Navigate to board detail
  const handleBoardPress = (board: Board) => {
    navigation.navigate('BoardDetail', { 
      boardId: board.id,
      boardName: board.name,
      workspaceId: '' // You might want to pass the actual workspace ID if needed
    });
  };

  // Navigate to create board screen
  const handleCreateBoard = () => {
    navigation.navigate('CreateBoard', {
      workspaceId: '', // You might want to select a default workspace
      workspaceName: 'Mon Espace'
    });
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Déconnexion',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  // Get color for board based on index or Trello color
  const getBoardColor = (board: Board, index: number) => {
    const colorOptions = [
      colors.tableRed,
      colors.tablePurple,
      colors.accent,
      '#0079BF',
      '#D29034',
      '#519839',
      '#B04632'
    ];
    
    // Use Trello color if available, otherwise use our color palette
    return board.prefs?.backgroundColor || colorOptions[index % colorOptions.length];
  };
  
  // Render board item
  const renderBoardItem = ({ item, index }: { item: Board, index: number }) => (
    <TouchableOpacity
      style={[styles.tableItem, { backgroundColor: getBoardColor(item, index) }]}
      onPress={() => handleBoardPress(item)}
    >
      <Text style={styles.tableText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="TABLEAUX" showMenu={true} />
     
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBoards}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Workspace title */}
            <Text style={styles.contentTitle}>
              {username 
                ? `Espace de travail de '${username}'` 
                : 'Espace de travail'}
            </Text>
            
            {/* Board list */}
            <View style={styles.tableList}>
              {boards.length > 0 ? (
                <FlatList
                  data={boards}
                  renderItem={renderBoardItem}
                  keyExtractor={(item) => item.id}
                  style={{ marginTop: 10 }}
                />
              ) : (
                <View style={styles.emptyBoardsContainer}>
                  <Text style={styles.emptyBoardsText}>Aucun tableau disponible</Text>
                  <TouchableOpacity
                    style={styles.createBoardButton}
                    onPress={handleCreateBoard}
                  >
                    <Text style={styles.createBoardButtonText}>Créer un tableau</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
        
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleCreateBoard}
          >
            <Text style={styles.bottomButtonText}>Créer un tableau</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.bottomButton, { marginLeft: 10, backgroundColor: '#f44336' }]}
            onPress={handleLogout}
          >
            <Text style={styles.bottomButtonText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Styles remain the same
const useHomeStyles = createThemedStyles(colors => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  contentTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  tableList: {
    marginTop: 10,
    flex: 1,
  },
  tableItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 3,
  },
  tableText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomButton: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  bottomButtonText: {
    color: colors.textLight,
    fontSize: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  emptyBoardsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBoardsText: {
    fontSize: 14,
    marginBottom: 10,
  },
  createBoardButton: {
    backgroundColor: colors.accent,
    padding: 8,
    borderRadius: 5,
  },
  createBoardButtonText: {
    color: colors.textLight,
  },
}));

export default HomeScreen;