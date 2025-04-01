import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../styles/color';

// Définition des propriétés du bouton personnalisable
type BottomButtonProps = {
  title: string; 
  onPress: () => void;
  backgroundColor?: string; // optionnelle
};


/**
 * Bouton réutilisable pour le BottomScreen
 * On peut personaliser la couleur et sa fonction 
 */
const BottomButton: React.FC<BottomButtonProps> = ({ 
  title, 
  onPress, 
  backgroundColor = colors.buttonSecondary 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.bottomButton, { backgroundColor }]}
      onPress={onPress}
    >
      <Text style={styles.bottomButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Style du bouton avec coins arrondis
  bottomButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  // Style de texte en blanc
  bottomButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default BottomButton;