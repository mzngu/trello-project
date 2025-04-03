import React, { useState, useEffect, useCallback } from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { BoardService, ListService, CardService, handleApiError } from '../services/api';
import { useTheme, createThemedStyles } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import Header from '../components/Header';
import TableCard from '../components/TableCard';
import { Pencil } from 'lucide-react-native'; 

type BoardDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BoardDetail'>;
type BoardDetailScreenRouteProp = RouteProp<RootStackParamList, 'BoardDetail'>;

interface List {
  id: string;
  name: string;
  cards?: Card[];
}

interface Card {
  id: string;
  name: string;
  desc?: string;
  idMembers?: string[];
  members?: { id: string; fullName: string; username: string }[];
}

const BoardDetailScreen = () => {
  const navigation = useNavigation<BoardDetailScreenNavigationProp>();
  const route = useRoute<BoardDetailScreenRouteProp>();
  const { colors } = useTheme();
  const { isLandscape } = useResponsive();
  const { boardId, boardName: initialBoardName, workspaceId } = route.params;

  const getStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      flexDirection: isLandscape ? 'row' : 'column',
    },
    listsContainer: {
      flexDirection: isLandscape ? 'row' : 'column',
      padding: 10,
    },
    listColumn: {
      width: isLandscape ? 250 : '100%',
      backgroundColor: colors.card,
      borderRadius: 5,
      margin: 5,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    boardNameContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    boardNameDisplayContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    boardNameText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      flex: 1,
    },
    boardNameInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      paddingVertical: 5,
    },

    editBoardNameButton: {
      marginLeft: 10,
    },
    // Existing styles remain the same
    content: {
      flex: 1,
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
    listsContainer: {
      flex: 1,
      padding: 10,
    },
    Column: {
      width: 280,
      backgroundColor: colors.card,
      borderRadius: 5,
      marginRight: 10,
      padding: 10,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    listColumn: {
      width: 280,
      backgroundColor: colors.card,
      borderRadius: 5,
      marginRight: 10,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    archiveButton: {
      fontSize: 24,
      color: colors.textSecondary,
      padding: 5,
    },
    cardsList: {
      maxHeight: '100%',
      backgroundColor: colors.background, 
      },
    addCardButton: {
      padding: 10,
      backgroundColor: colors.background, // Utilisez la couleur de fond des inputs
      borderRadius: 3,
      marginTop: 10,
    },
    addCardButtonText: {
      color: colors.textSecondary,
      textAlign: 'center',
    },
    addListColumn: {
      width: 280,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 5,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
      borderStyle: 'dashed',
      height: 80,
    },
    addListText: {
      color: colors.text,
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
    },
    modalInput: {
      backgroundColor: colors.inputBackground,
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
    },
    textareaInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#e0e0e0',
      marginRight: 10,
    },
    cancelButtonText: {
      color: colors.text,
    },
    confirmButton: {
      backgroundColor: colors.accent,
    },
    confirmButtonText: {
      color: colors.textLight,
      fontWeight: 'bold',
    },
  });


  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states for creating new list and card
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  
  // Board name editing states
  const [boardName, setBoardName] = useState(initialBoardName);
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);

  // Fetch board data (lists and cards)
  const fetchBoardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch lists for the board
      const listsData = await BoardService.getBoardLists(boardId);
      
      // For each list, fetch its cards
      const listsWithCards = await Promise.all(
        listsData.map(async (list: List) => {
          const cards = await ListService.getListCards(list.id);
          return { ...list, cards };
        })
      );
      
      setLists(listsWithCards);
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to load board data');
      setError(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update board name
  const handleUpdateBoardName = async () => {
    if (!boardName.trim()) {
      Alert.alert('Erreur', 'Le nom du tableau ne peut pas être vide');
      return;
    }

    try {
      setIsLoading(true);
      await BoardService.updateBoard(boardId, { name: boardName });
      setIsEditingBoardName(false);
    } catch (error) {
      const errorInfo = handleApiError(error, 'Impossible de mettre à jour le nom du tableau');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on initial render
  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

  // Refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBoardData();
    }, [boardId])
  );

  // Create a new list
  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la liste');
      return;
    }

    try {
      setIsLoading(true);
      await ListService.createList({
        name: newListName,
        boardId: boardId
      });
      
      // Reset form and close modal
      setNewListName('');
      setShowNewListModal(false);
      
      // Refresh board data
      fetchBoardData();
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to create list');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show the new card modal
  const showAddCardModal = (listId: string) => {
    setSelectedListId(listId);
    setNewCardName('');
    setNewCardDescription('');
    setShowNewCardModal(true);
  };

  // Create a new card
  const handleCreateCard = async () => {
    if (!newCardName.trim() || !selectedListId) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la carte');
      return;
    }

    try {
      setIsLoading(true);
      await CardService.createCard({
        name: newCardName,
        description: newCardDescription,
        listId: selectedListId
      });
      
      // Reset form and close modal
      setNewCardName('');
      setNewCardDescription('');
      setShowNewCardModal(false);
      setSelectedListId(null);
      
      // Refresh board data
      fetchBoardData();
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to create card');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle card press
  const handleCardPress = (card: Card, listId: string) => {
    navigation.navigate('CardDetail', {
      cardId: card.id,
      cardName: card.name,
      listId: listId,
      boardId: boardId
    });
  };

  // Archive a list
  const handleArchiveList = (listId: string, listName: string) => {
    Alert.alert(
      'Archiver la liste',
      `Êtes-vous sûr de vouloir archiver "${listName}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Archiver',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await ListService.archiveList(listId);
              fetchBoardData();
            } catch (error) {
              const errorInfo = handleApiError(error, 'Failed to archive list');
              Alert.alert('Erreur', errorInfo.message);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const styles = getStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="TABLEAUX"
        showMenu={true}
      />

      {/* Board Name Editing Section */}
      <View style={styles.boardNameContainer}>
        {isEditingBoardName ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={styles.boardNameInput}
              value={boardName}
              onChangeText={setBoardName}
              autoFocus
              onBlur={handleUpdateBoardName}
              onSubmitEditing={handleUpdateBoardName}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        ) : (
          <View style={styles.boardNameDisplayContainer}>
            <Text style={styles.boardNameText}>{boardName}</Text>
            <TouchableOpacity 
              onPress={() => setIsEditingBoardName(true)}
            >
              <Pencil size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ marginTop: 10, color: colors.textSecondary }}>
              Chargement du tableau...
            </Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>
              {error}
            </Text>
            <TouchableOpacity 
              style={{ 
                backgroundColor: colors.accent, 
                padding: 10, 
                borderRadius: 5 
              }} 
              onPress={fetchBoardData}
            >
              <Text style={{ color: colors.textLight, fontWeight: 'bold' }}>
                Réessayer
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            horizontal={isLandscape}
            style={styles.listsContainer}
          >
            {lists.map(list => (
              <View key={list.id} style={styles.listColumn}>
                {/* Rest of the list rendering remains the same */}
              </View>
            ))}
            
            {/* Add List Button */}
            <TouchableOpacity
              style={{
                width: 280,
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: 5,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.1)',
                borderStyle: 'dashed',
                height: 80,
              }}
              onPress={() => setShowNewListModal(true)}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                + Ajouter une liste
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
      
      {/* Modal for adding a new list */}
      <Modal
        visible={showNewListModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewListModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle liste</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nom de la liste"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNewListModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateList}
              >
                <Text style={styles.confirmButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal for adding a new card */}
      <Modal
        visible={showNewCardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewCardModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle carte</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Titre de la carte"
              value={newCardName}
              onChangeText={setNewCardName}
              autoFocus
            />
            
            <TextInput
              style={[styles.modalInput, styles.textareaInput]}
              placeholder="Description (optionnelle)"
              value={newCardDescription}
              onChangeText={setNewCardDescription}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNewCardModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateCard}
              >
                <Text style={styles.confirmButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Use createThemedStyles to create dynamic styles
const useBoardDetailStyles = createThemedStyles(colors => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Add new board name editing styles
  boardNameContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  boardNameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boardNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  editBoardNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boardNameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 5,
  },
  editBoardNameButton: {
    marginLeft: 10,
  },
  // Existing styles remain the same
  content: {
    flex: 1,
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
  listsContainer: {
    flex: 1,
    padding: 10,
  },
  Column: {
    width: 280,
    backgroundColor: colors.card,
    borderRadius: 5,
    marginRight: 10,
    padding: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  listColumn: {
    width: 280,
    backgroundColor: colors.card,
    borderRadius: 5,
    marginRight: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  archiveButton: {
    fontSize: 24,
    color: colors.textSecondary,
    padding: 5,
  },
  cardsList: {
    maxHeight: '100%',
    backgroundColor: colors.background, 
    },
  addCardButton: {
    padding: 10,
    backgroundColor: colors.background, // Utilisez la couleur de fond des inputs
    borderRadius: 3,
    marginTop: 10,
  },
  addCardButtonText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addListColumn: {
    width: 280,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    height: 80,
  },
  addListText: {
    color: colors.text,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.inputBackground,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  textareaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.accent,
  },
  confirmButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
}));

export default BoardDetailScreen;