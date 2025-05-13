import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import colors from '../styles/color';

type TableCardProps = {
  id: string;
  title: string;
  color: string;
  onPress: () => void;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TableCard: React.FC<TableCardProps> = ({
  id,
  title,
  color,
  onPress
}) => {
  return (
    <TouchableOpacity
      style={[styles.tableItem, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.tableText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tableItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 3,
  },
  tableText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TableCard;