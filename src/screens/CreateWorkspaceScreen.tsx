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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { WorkspaceService, handleApiError } from '../services/api';
import { useTheme, createThemedStyles } from '../context/ThemeContext';
import Header from '../components/Header';

type CreateWorkspaceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateWorkspace'>;

const CreateWorkspaceScreen = () => {
  const navigation = useNavigation<CreateWorkspaceScreenNavigationProp>();
  const { colors } = useTheme();
  const styles = useCreateWorkspaceStyles();

  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [workspaceWebsite, setWorkspaceWebsite] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Handle workspace creation
  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour l\'espace de travail');
      return;
    }

    try {
      setIsCreating(true);
      
      // Create workspace
      const newWorkspace = await WorkspaceService.createWorkspace({
        displayName: workspaceName,
        description: workspaceDescription,
        website: workspaceWebsite
      });
      
      // Navigate back to Home screen
      navigation.replace('Home');
      
      // Show success message
      Alert.alert(
        'Succès',
        `L'espace de travail "${workspaceName}" a été créé avec succès.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to create workspace');
      Alert.alert('Erreur', errorInfo.message);
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Créer un espace de travail"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations de base</Text>
          
          <Text style={styles.inputLabel}>Nom de l'espace de travail *</Text>
          <TextInput
            style={styles.input}
            value={workspaceName}
            onChangeText={setWorkspaceName}
            placeholder="Ex: Mon Entreprise, Équipe Marketing..."
            autoFocus
          />
          
          <Text style={styles.inputLabel}>Description (optionnelle)</Text>
          <TextInput
            style={[styles.input, styles.textareaInput]}
            value={workspaceDescription}
            onChangeText={setWorkspaceDescription}
            placeholder="Décrivez le but de cet espace de travail..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <Text style={styles.inputLabel}>Site web (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={workspaceWebsite}
            onChangeText={setWorkspaceWebsite}
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>À propos des espaces de travail</Text>
          <Text style={styles.sectionDescription}>
            Les espaces de travail vous permettent d'organiser vos tableaux et de collaborer avec votre équipe.
            Vous pouvez créer plusieurs espaces de travail pour différents projets ou équipes.
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Organisez vos tableaux par espace de travail</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Invitez des membres à rejoindre votre espace</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Gérez les permissions et les rôles</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.createButton,
            !workspaceName.trim() && styles.disabledButton
          ]}
          onPress={handleCreateWorkspace}
          disabled={!workspaceName.trim() || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Text style={styles.createButtonText}>Créer l'espace de travail</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Use createThemedStyles to create dynamic styles
const useCreateWorkspaceStyles = createThemedStyles(colors => StyleSheet.create({
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
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
  featuresList: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  featureIcon: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
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

export default CreateWorkspaceScreen;