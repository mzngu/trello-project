import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
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

interface CardPositions {
  [cardId: string]: {
    listId: string;
    index: number;
  };
}

const BoardDetailScreen = () => {
  const navigation = useNavigation<BoardDetailScreenNavigationProp>();
  const route = useRoute<BoardDetailScreenRouteProp>();
  const { colors } = useTheme();
  const { isLandscape } = useResponsive();
  const { boardId, boardName: initialBoardName, workspaceId } = route.params;
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<CardPositions>({});
  const [draggingCard, setDraggingCard] = useState<{
    id: string;
    listId: string;
    index: number;
    card: Card;
  } | null>(null);
  const [lists, setLists] = useState<List[]>([]); // Move the declaration and assignment of 'lists' here

  // Initialize card positions when lists change
  useEffect(() => {
    const positions: CardPositions = {};
    lists.forEach(list => {
      list.cards?.forEach((card, index) => {
        positions[card.id] = { listId: list.id, index };
      });
    });
    setCardPositions(positions);
  }, [lists]);

  // Handle card movement
  const moveCard = async (cardId: string, newListId: string, newIndex: number) => {
    try {
      setIsLoading(true);

      // Find the target list
      const targetList = lists.find(l => l.id === newListId);
      if (!targetList) return;

      // Calculate position
      let position: string | number = 'bottom';
      if (newIndex === 0) {
        position = 'top';
      } else if (targetList.cards && newIndex < targetList.cards.length) {
        // Calculate position between cards
        const prevCard = targetList.cards[newIndex - 1];
        const nextCard = targetList.cards[newIndex];
        position = (prevCard.pos + nextCard.pos) / 2;
      }

      await CardService.moveCard(cardId, {
        idList: newListId,
        pos: position
      });

      await fetchBoardData();
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to move card');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Draggable card component
  const DraggableCard = ({ card, listId, index }: { card: Card; listId: string; index: number }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const zIndex = useSharedValue(0);
    const cardHeight = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { startX: number; startY: number }
    >({
      onStart: (event, ctx) => {
        'worklet';
        isDragging.value = true;
        zIndex.value = 100;
        ctx.startX = translateX.value;
        ctx.startY = translateY.value;
        runOnJS(setDraggingCard)({ id: card.id, listId, index, card });
      },
      onActive: (event, ctx) => {
        'worklet';
        translateX.value = ctx.startX + event.translationX;
        translateY.value = ctx.startY + event.translationY;
      },
      onEnd: () => {
        'worklet';
        isDragging.value = false;
        zIndex.value = 0;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        runOnJS(setDraggingCard)(null);
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      zIndex: zIndex.value,
      opacity: isDragging.value ? 0.9 : 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isDragging.value ? 5 : 2 },
      shadowOpacity: isDragging.value ? 0.3 : 0.1,
      shadowRadius: isDragging.value ? 10 : 2,
      elevation: isDragging.value ? 10 : 2,
      marginBottom: 8,
    }));

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[styles.cardContainer, animatedStyle]}
          onLayout={event => {
            cardHeight.value = event.nativeEvent.layout.height;
          }}
        >
          <TableCard
            card={card}
            onPress={() => handleCardPress(card, listId)}
          />
        </Animated.View>
      </PanGestureHandler>
    );
  };

  // Drop zones for lists
  const DropZone = ({ listId, listIndex }: { listId: string; listIndex: number }) => {
    const handleDrop = () => {
      if (draggingCard && draggingCard.listId !== listId) {
        moveCard(draggingCard.id, listId, 0); // Add to top of the new list
      }
    };

    return (
      <View
        style={[
          styles.dropZone,
          draggingCard && draggingCard.listId !== listId && styles.dropZoneActive
        ]}
        onTouchEnd={handleDrop}
      />
    );
  };


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
    cardContainer: {
      marginBottom: 10,
      backgroundColor: colors.card,
      borderRadius: 5,
      padding: 10,
    },
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
    try {… }
  };
  // Update board name
  const handleUpdateBoardName = async () => {
    if (!boardName.trim()) {… }
    try {… }
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
    if (!newListName.trim()) {… }
    try {… }
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
    if (!newCardName.trim() || !selectedListId) {… }
    try {… }
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
  const handleArchiveList = (listId: string, listName: string) => {… };
  const styles = getStyles();
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
          contentContainerStyle={styles.listsContentContainer}
        >
          {lists.map((list, listIndex) => (
            <View key={list.id} style={styles.listColumn}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>{list.name}</Text>
                <TouchableOpacity onPress={() => handleArchiveList(list.id, list.name)}>
                  <Text style={styles.archiveButton}>×</Text>
                </TouchableOpacity>
              </View>

              <DropZone listId={list.id} listIndex={listIndex} />

              <ScrollView
                style={styles.cardsList}
                nestedScrollEnabled
              >
                {list.cards?.map((card, index) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    listId={list.id}
                    index={index}
                  />
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.addCardButton}
                onPress={() => showAddCardModal(list.id)}
              >
                <Text style={styles.addCardButtonText}>Ajouter une carte</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Modal for adding a new list */}
          < Modal
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
      shadowOffset: {width: 0, height: 2 },
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
      backgroundColor: colors.background,
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