import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useTheme, createThemedStyles } from '../context/ThemeContext';
import Header from '../components/Header';
import { BoardService } from '../services/api';
import { handleApiError } from '../services/api';

type CreateBoardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateBoard'>;
type CreateBoardScreenRouteProp = RouteProp<RootStackParamList, 'CreateBoard'>;

// Templates for board creation
const BOARD_TEMPLATES = [
  {
    id: 'kanban',
    name: 'Kanban',
    description: 'Visualize work, limit work-in-progress, and maximize efficiency',
    lists: ['To Do', 'Doing', 'Done']
  },
  {
    id: 'simple',
    name: 'Simple Project',
    description: 'Basic project management board',
    lists: ['Backlog', 'In Progress', 'Completed']
  }
];

const CreateBoardScreen = () => {
  const navigation = useNavigation<CreateBoardScreenNavigationProp>();
  const route = useRoute<CreateBoardScreenRouteProp>();
  const { colors } = useTheme();
  const styles = useCreateBoardStyles();

  const { workspaceId, workspaceName } = route.params;

  // Board creation states
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Handle board creation
  const handleCreateBoard = async () => {
    // Validate inputs
    if (!boardName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour le tableau');
      return;
    }

    try {
      setIsCreating(true);

      // Create board with selected template
      const newBoard = await BoardService.createBoard({
        name: boardName,
        description: boardDescription,
        workspaceId: workspaceId,
        template: selectedTemplate || 'simple'
      });

      // Navigate back to workspace or board detail
      navigation.replace('BoardDetail', {
        boardId: newBoard.id,
        boardName: newBoard.name,
        workspaceId: workspaceId
      });

      // Show success message
      Alert.alert(
        'Succès',
        `Le tableau "${boardName}" a été créé avec succès.`,
        [{text: 'OK'}]
      );
    } catch (error) {
      const errorInfo = handleApiError(error, 'Échec de la création du tableau');
      Alert.alert('Erreur', errorInfo.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Créer un tableau"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Board Basic Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations du tableau</Text>

          <Text style={styles.inputLabel}>Nom du tableau *</Text>
          <TextInput
            style={styles.input}
            value={boardName}
            onChangeText={setBoardName}
            placeholder="Ex: Projet Marketing, Développement Web..."
            autoFocus
          />

          <Text style={styles.inputLabel}>Description (optionnelle)</Text>
          <TextInput
            style={[styles.input, styles.textareaInput]}
            value={boardDescription}
            onChangeText={setBoardDescription}
            placeholder="Décrivez l'objectif de ce tableau..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Template Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Choisir un modèle</Text>

          {BOARD_TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateItem,
                selectedTemplate === template.id && styles.selectedTemplate
              ]}
              onPress={() => setSelectedTemplate(template.id)}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                {selectedTemplate === template.id && (
                  <Text style={styles.selectedIcon}>✓</Text>
                )}
              </View>
              <Text style={styles.templateDescription}>
                {template.description}
              </Text>
              <View style={styles.templateListPreview}>
                {template.lists.map((list, index) => (
                  <View key={index} style={styles.templateListItem}>
                    <Text style={styles.templateListItemText}>{list}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Board Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!boardName.trim() || isCreating) && styles.disabledButton
          ]}
          onPress={handleCreateBoard}
          disabled={!boardName.trim() || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Text style={styles.createButtonText}>
              Créer le tableau
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles using createThemedStyles
const useCreateBoardStyles = createThemedStyles(colors => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: colors.textPrimary,
  },
  textareaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  templateItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedTemplate: {
    borderColor: colors.accent,
    backgroundColor: colors.inputBackground,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  selectedIcon: {
    color: colors.accent,
    fontSize: 18,
  },
  templateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  templateListPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  templateListItem: {
    backgroundColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  templateListItemText: {
    fontSize: 12,
    color: colors.textLight,
  },
  createButton: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
  },
  createButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
}));

export default CreateBoardScreen;