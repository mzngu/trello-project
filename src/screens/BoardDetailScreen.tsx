import React, { useState, useEffect, useCallback } from 'react';
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
import { NavigationActions } from '@react-navigation/native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { BoardService, ListService, CardService, handleApiError } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import Header from '../components/Header';
import TableCard from '../components/TableCard';

const PencilIcon = () => <Text style={{ fontSize: 20 }}>✎</Text>;
const TrashIcon = () => <Text style={{ fontSize: 20 }}>🗑️</Text>;

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

  // Dynamic styles based on orientation and theme
  const getStyles = () => {
    const { width } = Dimensions.get('window');
    const listWidth = isLandscape ? width * 0.4 : '100%';

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      content: {
        flex: 1,
        flexDirection: isLandscape ? 'row' : 'column',
      },
      boardNameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
      actionIcons: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      iconButton: {
        marginLeft: 15,
        padding: 5,
      },
      listsContainer: {
        flexDirection: isLandscape ? 'row' : 'column',
        padding: 10,
      },
      listColumn: {
        width: listWidth,
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
      cardsList: {
        maxHeight: '100%',
      },
      addCardButton: {
        padding: 10,
        backgroundColor: colors.inputBackground,
        borderRadius: 3,
        marginTop: 10,
        alignItems: 'center',
      },
      addCardButtonText: {
        color: colors.textSecondary,
      },
      archiveButton: {
        fontSize: 24,
        color: colors.textSecondary,
        padding: 5,
      },
      addListColumn: {
        width: isLandscape ? 280 : '95%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderStyle: 'dashed',
        height: 80,
      },
      addListText: {
        color: colors.text,
        fontSize: 16,
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
        color: colors.textPrimary,
      },
      modalInput: {
        backgroundColor: colors.inputBackground,
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        color: colors.textPrimary,
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
      confirmButton: {
        backgroundColor: colors.accent,
      },
      confirmButtonText: {
        color: colors.textLight,
        fontWeight: 'bold',
      },
      cancelButtonText: {
        color: colors.text,
      },
    });
  };

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

  // Delete board
  const handleDeleteBoardConfirmation = () => {
    Alert.alert(
      'Supprimer le tableau',
      `Êtes-vous sûr de vouloir supprimer "${boardName}" ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: handleDeleteBoard
        }
      ]
    );
  };

  const handleDeleteBoard = async () => {
    try {
      setIsLoading(true);
      await BoardService.deleteBoard(boardId);
      // Navigate back after deletion
      navigation.goBack();
    } catch (error) {
      const errorInfo = handleApiError(error, 'Impossible de supprimer le tableau');
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

  const handleCardPress = (card: Card, listId: string) => {
    // Vérification détaillée des données
    console.log('Card pressed - DETAILS:', {
      cardId: card?.id,
      cardName: card?.name,
      listId: listId,
      boardId: boardId,
      fullCardObject: card
    });

    // Validation stricte avant navigation
    if (!card || !card.id) {
      console.error('Invalid card data - cannot navigate', card);
      Alert.alert('Erreur', 'Impossible de charger les détails de la carte');
      return;
    }

    navigation.navigate('CardDetail', {
      cardId: card.id,
      cardName: card.name || 'Carte sans nom',
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

  // Compute styles dynamically
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
          <TextInput
            style={styles.boardNameInput}
            value={boardName}
            onChangeText={setBoardName}
            autoFocus
            onBlur={handleUpdateBoardName}
            onSubmitEditing={handleUpdateBoardName}
            placeholderTextColor={colors.textSecondary}
          />
        ) : (
          <>
            <Text style={styles.boardNameText}>{boardName}</Text>
            <View style={styles.actionIcons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setIsEditingBoardName(true)}
              >
                <PencilIcon />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleDeleteBoardConfirmation}
              >
                <TrashIcon />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Chargement du tableau...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBoardData}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            horizontal={isLandscape}
            contentContainerStyle={{
              flexDirection: isLandscape ? 'row' : 'column',
              alignItems: isLandscape ? 'flex-start' : 'stretch',
            }}
            style={styles.listsContainer}
          >
            {lists.map(list => (
              <View key={list.id} style={styles.listColumn}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>{list.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleArchiveList(list.id, list.name)}
                  >
                    <Text style={styles.archiveButton}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.cardsList}>
                  {list.cards?.map(card => (
                    <TableCard
                      key={card.id}
                      id={card.id}
                      title={card.name}
                      color={colors.card}
                      onPress={() => handleCardPress(card, list.id)}
                    />
                  ))}
                  
                  <TouchableOpacity
                    style={styles.addCardButton}
                    onPress={() => showAddCardModal(list.id)}
                  >
                    <Text style={styles.addCardButtonText}>+ Ajouter une carte</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.addListColumn}
              onPress={() => setShowNewListModal(true)}
            >
              <Text style={styles.addListText}>+ Ajouter une liste</Text>
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
              placeholderTextColor={colors.textSecondary}
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
              placeholderTextColor={colors.textSecondary}
              value={newCardName}
              onChangeText={setNewCardName}
              autoFocus
            />
            
            <TextInput
              style={[styles.modalInput, styles.textareaInput]}
              placeholder="Description (optionnelle)"
              placeholderTextColor={colors.textSecondary}
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

export default BoardDetailScreen;