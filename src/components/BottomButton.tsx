import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../styles/color';

type BottomButtonProps = {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
};

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
  bottomButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default BottomButton;