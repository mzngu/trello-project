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
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { CardService, BoardService, handleApiError } from '../services/api';
import { useTheme, createThemedStyles } from '../context/ThemeContext';
import Header from '../components/Header';

const PencilIcon = () => <Text style={{ fontSize: 20 }}>✎</Text>;
const TrashIcon = () => <Text style={{ fontSize: 20 }}>🗑️</Text>;

type CardDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CardDetail'>;
type CardDetailScreenRouteProp = RouteProp<RootStackParamList, 'CardDetail'>;

interface Member {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
}

interface Comment {
  id: string;
  data: {
    text: string;
  };
  date: string;
  memberCreator: {
    fullName: string;
    username: string;
  };
}

interface CardData {
  id: string;
  name: string;
  desc: string;
  idList: string;
  due?: string;
  dueComplete?: boolean;
  idMembers: string[];
  members?: Member[];
}

const CardDetailScreen = () => {
  const navigation = useNavigation<CardDetailScreenNavigationProp>();
  const route = useRoute<CardDetailScreenRouteProp>();
  const { cardId, cardName, listId, boardId } = route.params;
  const { colors } = useTheme();
  const styles = useCardDetailStyles();

  const [card, setCard] = useState<CardData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [boardMembers, setBoardMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Comment states
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Member assignment modal
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Validation function for card data
  const validateCardData = () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom de la carte ne peut pas être vide');
      return false;
    }
    if (editName.length > 100) {
      Alert.alert('Erreur', 'Le nom de la carte ne peut pas dépasser 100 caractères');
      return false;
    }
    if (editDescription && editDescription.length > 500) {
      Alert.alert('Erreur', 'La description ne peut pas dépasser 500 caractères');
      return false;
    }
    return true;
  };

  // Fetch card data
  const fetchCardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch card details
      const cardData = await CardService.getCard(cardId);
      setCard(cardData);
      setEditName(cardData.name);
      setEditDescription(cardData.desc || '');

      // Fetch comments
      const commentsData = await CardService.getComments(cardId);
      setComments(commentsData);

      // Fetch board members
      const membersData = await BoardService.getBoardMembers(boardId);
      setBoardMembers(membersData);
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to load card data');
      setError(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on initial render
  useEffect(() => {
    fetchCardData();
  }, [cardId]);

  // Refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCardData();
    }, [cardId])
  );

 // Confirmation before deletion
  const handleDeleteCardConfirmation = () => {
    Alert.alert(
      'Supprimer la carte',
      `Êtes-vous sûr de vouloir supprimer "${cardName}" ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: handleDeleteCard
        }
      ]
    );
  };

  // Delete card
  const handleDeleteCard = async () => {
    try {
      setIsLoading(true);
      await CardService.deleteCard(cardId);

      // Show success message before navigating
      Alert.alert('Succès', 'Carte supprimée avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      const errorInfo = handleApiError(error, 'Impossible de supprimer la carte');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Save card changes with validation
  const handleSaveChanges = async () => {
    // Validate data before saving
    if (!validateCardData()) {
      return;
    }

    try {
      setIsLoading(true);
      await CardService.updateCard(cardId, {
        name: editName.trim(),
        description: editDescription.trim()
      });

      // Show success message
      Alert.alert('Succès', 'Carte mise à jour avec succès');

      setIsEditMode(false);
      fetchCardData(); // Refresh data
    } catch (error) {
      const errorInfo = handleApiError(error, 'Impossible de mettre à jour la carte');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      setIsAddingComment(true);
      await CardService.addComment(cardId, newComment);
      setNewComment('');
      fetchCardData(); // Refresh comments
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to add comment');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsAddingComment(false);
    }
  };

  // Toggle member assignment
  const toggleMemberAssignment = async (memberId: string) => {
    try {
      setIsLoading(true);

      const isMemberAssigned = card?.idMembers.includes(memberId);

      if (isMemberAssigned) {
        await CardService.removeMember(cardId, memberId);
      } else {
        await CardService.assignMember(cardId, memberId);
      }

      fetchCardData(); // Refresh data
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to update member assignment');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };



  // Format date for display
   const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     return date.toLocaleString('fr-FR', {
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     });
   };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEditMode ? "Modifier la carte" : cardName}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />


      <View style={styles.content}>
        {isLoading && !card ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Chargement de la carte...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCardData}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer}>
            {isEditMode ? (
              // Edit mode view
              <View style={styles.editContainer}>
                <Text style={styles.inputLabel}>Titre</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Titre de la carte"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textareaInput]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Description (optionnelle)"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setIsEditMode(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSaveChanges}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.textLight} />
                    ) : (
                      <Text style={styles.saveButtonText}>Enregistrer</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Display mode view
              <>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  {card?.desc ? (
                    <Text style={styles.descriptionText}>{card.desc}</Text>
                  ) : (
                    <Text style={styles.emptyText}>Aucune description</Text>
                  )}
                </View>

                <View style={styles.cardSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Membres assignés</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => setShowMembersModal(true)}
                    >
                      <Text style={styles.addButtonText}>Gérer</Text>
                    </TouchableOpacity>
                  </View>

                  {card?.members && card.members.length > 0 ? (
                    <View style={styles.membersList}>
                      {card.members.map(member => (
                        <View key={member.id} style={styles.memberItem}>
                          <View style={styles.memberAvatar}>
                            <Text style={styles.memberInitial}>
                              {member.fullName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.memberName}>{member.fullName}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>Aucun membre assigné</Text>
                  )}
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionTitle}>Commentaires</Text>

                  <View style={styles.addCommentContainer}>
                    <TextInput
                      style={styles.commentInput}
                      value={newComment}
                      onChangeText={setNewComment}
                      placeholder="Ajouter un commentaire..."
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.commentButton,
                        !newComment.trim() && styles.disabledButton
                      ]}
                      onPress={handleAddComment}
                      disabled={!newComment.trim() || isAddingComment}
                    >
                      {isAddingComment ? (
                        <ActivityIndicator size="small" color={colors.textLight} />
                      ) : (
                        <Text style={styles.commentButtonText}>Ajouter</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {comments.length > 0 ? (
                    <View style={styles.commentsList}>
                      {comments.map(comment => (
                        <View key={comment.id} style={styles.commentItem}>
                          <View style={styles.commentHeader}>
                            <View style={styles.memberAvatar}>
                              <Text style={styles.memberInitial}>
                                {comment.memberCreator.fullName.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.commentInfo}>
                              <Text style={styles.commentAuthor}>
                                {comment.memberCreator.fullName}
                              </Text>
                              <Text style={styles.commentDate}>
                                {formatDate(comment.date)}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.commentText}>{comment.data.text}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>Aucun commentaire</Text>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => setIsEditMode(true)}
                  >
                    <Text style={styles.editButtonText}>Modifier</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDeleteCard}
                  >
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>

      {/* Members assignment modal */}
      <Modal
        visible={showMembersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assigner des membres</Text>

            <ScrollView style={styles.modalScrollView}>
              {boardMembers.map(member => {
                const isAssigned = card?.idMembers.includes(member.id);

                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.modalMemberItem,
                      isAssigned && styles.assignedMemberItem
                    ]}
                    onPress={() => toggleMemberAssignment(member.id)}
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>
                        {member.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.modalMemberName}>{member.fullName}</Text>
                    {isAssigned && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowMembersModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Use createThemedStyles to create dynamic styles
const useCardDetailStyles = createThemedStyles(colors => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  actionIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: colors.card,
  },
      actionIcon: {
          marginLeft: 15,
        padding: 5,
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
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  cardSection: {
    backgroundColor: colors.card,
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.textLight,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  membersList: {
    marginTop: 5,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberInitial: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 12,
  },
  addCommentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 3,
    padding: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  commentButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  commentsList: {
    marginTop: 10,
  },
  commentItem: {
    backgroundColor: colors.inputBackground,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.accent,
    marginRight: 10,
  },
  editButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  // Edit mode styles
  editContainer: {
    padding: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 3,
    padding: 10,
    marginBottom: 15,
  },
  textareaInput: {
    minHeight: 100,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  saveButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
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
  modalScrollView: {
    maxHeight: 300,
  },
  modalMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  modalMemberName: {
    fontSize: 14,
    flex: 1,
  },
  assignedMemberItem: {
    backgroundColor: 'rgba(0,150,136,0.1)',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  closeModalButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
}));

export default CardDetailScreen;