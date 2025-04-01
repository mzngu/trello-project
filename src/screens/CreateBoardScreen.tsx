import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { BoardService, handleApiError } from '../services/api';
import { useTheme, createThemedStyles } from '../context/ThemeContext';
import Header from '../components/Header';

type CreateBoardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateBoard'>;
type CreateBoardScreenRouteProp = RouteProp<RootStackParamList, 'CreateBoard'>;

// Board template options
const BOARD_TEMPLATES = [
  { id: 'kanban', name: 'Kanban', description: 'À faire, En cours, Terminé' },
  { id: 'sprint', name: 'Sprint', description: 'Backlog, Planning, En cours, Revue, Terminé' },
  { id: 'project', name: 'Projet', description: 'Idées, Planning, En cours, Test, Terminé' },
  { id: 'none', name: 'Tableau vide', description: 'Aucune liste pré-définie' }
];

// Color options for the board
const BOARD_COLORS = [
  { id: 'blue', color: '#0079BF', name: 'Bleu' },
  { id: 'orange', color: '#D29034', name: 'Orange' },
  { id: 'green', color: '#519839', name: 'Vert' },
  { id: 'red', color: '#B04632', name: 'Rouge' },
  { id: 'purple', color: '#89609E', name: 'Violet' },
  { id: 'pink', color: '#CD5A91', name: 'Rose' },
  { id: 'lime', color: '#4BBF6B', name: 'Lime' },
  { id: 'sky', color: '#00AECC', name: 'Ciel' },
  { id: 'grey', color: '#838C91', name: 'Gris' }
];

const CreateBoardScreen = () => {
  const navigation = useNavigation<CreateBoardScreenNavigationProp>();
  const route = useRoute<CreateBoardScreenRouteProp>();
  const { workspaceId, workspaceName } = route.params;
  const { colors } = useTheme();
  const styles = useCreateBoardStyles();

  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(BOARD_TEMPLATES[0].id);
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0].id);
  const [isCreating, setIsCreating] = useState(false);

  // Handle board creation
  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour le tableau');
      return;
    }

    try {
      setIsCreating(true);
      
      // Find the color object
      const colorObj = BOARD_COLORS.find(color => color.id === selectedColor);
      
      // Create board
      const newBoard = await BoardService.createBoard({
        name: boardName,
        description: boardDescription,
        workspaceId: workspaceId,
        template: selectedTemplate !== 'none' ? selectedTemplate : undefined,
        prefs: {
          backgroundColor: colorObj?.color
        }
      });
      
      // Navigate to the newly created board
      navigation.replace('BoardDetail', {
        boardId: newBoard.id,
        boardName: newBoard.name,
        workspaceId: workspaceId
      });
      
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to create board');
      Alert.alert('Erreur', errorInfo.message);
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Créer un tableau"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.workspaceInfo}>
            Espace de travail: <Text style={styles.workspaceName}>{workspaceName}</Text>
          </Text>
          
          <Text style={styles.inputLabel}>Nom du tableau *</Text>
          <TextInput
            style={styles.input}
            value={boardName}
            onChangeText={setBoardName}
            placeholder="Ex: Développement produit, Marketing campagne..."
            autoFocus
          />
          
          <Text style={styles.inputLabel}>Description (optionnelle)</Text>
          <TextInput
            style={[styles.input, styles.textareaInput]}
            value={boardDescription}
            onChangeText={setBoardDescription}
            placeholder="Décrivez le but de ce tableau..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Modèle</Text>
          <Text style={styles.sectionDescription}>
            Choisissez un modèle pour commencer avec des listes pré-définies
          </Text>
          
          <View style={styles.templateOptions}>
            {BOARD_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateOption,
                  selectedTemplate === template.id && styles.selectedTemplate
                ]}
                onPress={() => setSelectedTemplate(template.id)}
              >
                <Text 
                  style={[
                    styles.templateName,
                    selectedTemplate === template.id && styles.selectedTemplateName
                  ]}
                >
                  {template.name}
                </Text>
                <Text 
                  style={[
                    styles.templateDescription,
                    selectedTemplate === template.id && styles.selectedTemplateDescription
                  ]}
                >
                  {template.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Couleur d'arrière-plan</Text>
          
          <View style={styles.colorOptions}>
            {BOARD_COLORS.map((colorOption) => (
              <TouchableOpacity
                key={colorOption.id}
                style={[
                  styles.colorOption,
                  { backgroundColor: colorOption.color },
                  selectedColor === colorOption.id && styles.selectedColor
                ]}
                onPress={() => setSelectedColor(colorOption.id)}
              >
                {selectedColor === colorOption.id && (
                  <Text style={styles.colorCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.createButton,
            !boardName.trim() && styles.disabledButton
          ]}
          onPress={handleCreateBoard}
          disabled={!boardName.trim() || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Text style={styles.createButtonText}>Créer le tableau</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Use createThemedStyles to create dynamic styles
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
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  workspaceInfo: {
    fontSize: 14,
    marginBottom: 15,
    color: colors.textSecondary,
  },
  workspaceName: {
    fontWeight: 'bold',
    color: colors.text,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  templateOptions: {
    marginBottom: 10,
  },
  templateOption: {
    backgroundColor: colors.inputBackground,
    borderRadius: 3,
    padding: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTemplate: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}20`, // 20% opacity
  },
  templateName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  selectedTemplateName: {
    color: colors.accent,
  },
  templateDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedTemplateDescription: {
    color: colors.text,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 4,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#ffffff',
  },
  colorCheckmark: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  createButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
}));

export default CreateBoardScreen;