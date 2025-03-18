import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext.tsx'; // Import the theme hook
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

// Predefined color options
const colorOptions = [
  { name: 'Light Blue', value: '#b3e5fc' },
  { name: 'Blue', value: '#90caf9' },
  { name: 'Purple', value: '#ce93d8' },
  { name: 'Pink', value: '#f8bbd0' },
  { name: 'Orange', value: '#ffcc80' },
  { name: 'Green', value: '#a5d6a7' },
  { name: 'Teal', value: '#80cbc4' },
  { name: 'Amber', value: '#ffe082' },
];

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors, setPrimaryColor } = useTheme(); // Use the theme hook
  
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors.primary);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  // Load saved color on component mount - no longer needed, handled by ThemeContext
  // but we need to ensure selectedColor is synced with the theme
  useEffect(() => {
    setSelectedColor(colors.primary);
  }, [colors.primary]);

  const handleSave = async () => {
    try {
      // Instead of manually saving to AsyncStorage, use the context method
      setPrimaryColor(selectedColor);
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Unable to save settings');
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setColorPickerVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            navigation.navigate('Login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="SETTINGS" showMenu={true} />
      
      <View style={styles.content}>
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>PROFILE</Text>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.text }]}>Name:</Text>
            <TextInput
              style={[styles.settingsInput, { borderBottomColor: colors.primary }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.text }]}>First name:</Text>
            <TextInput
              style={[styles.settingsInput, { borderBottomColor: colors.primary }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
            />
          </View>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.text }]}>Birth date:</Text>
            <TextInput
              style={[styles.settingsInput, { borderBottomColor: colors.primary }]}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="DD/MM/YYYY"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Private Info</Text>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.text }]}>E-mail:</Text>
            <Text style={[styles.settingsValue, { color: colors.text }]}>user@gmail.com</Text>
          </View>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.text }]}>Password:</Text>
            <Text style={[styles.settingsValue, { color: colors.text }]}>••••••••</Text>
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>General</Text>
          
          <View style={styles.settingsItem}>
            <Text style={[styles.settingsLabel, { color: colors.text }]}>Default color</Text>
            <TouchableOpacity 
              onPress={() => setColorPickerVisible(true)}
              style={styles.colorPickerButton}
            >
              <View style={[styles.colorSquare, { backgroundColor: selectedColor }]} />
              <Text style={[styles.colorPickerText, { color: colors.buttonSecondary }]}>Change color</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.settingsButtonsContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: colors.buttonDanger }]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Color Picker Modal */}
      <Modal
        visible={colorPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a color</Text>
            <FlatList
              data={colorOptions}
              keyExtractor={(item) => item.value}
              numColumns={4}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.colorOption}
                  onPress={() => handleColorSelect(item.value)}
                >
                  <View style={[styles.colorSample, { backgroundColor: item.value }]}>
                    {selectedColor === item.value && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </View>
                  <Text style={styles.colorName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setColorPickerVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsLabel: {
    width: 120,
    fontSize: 14,
  },
  settingsInput: {
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 3,
    fontSize: 14,
  },
  settingsValue: {
    flex: 1,
    fontSize: 14,
  },
  colorSquare: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'black',
  },
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPickerText: {
    fontSize: 14,
  },
  settingsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  colorOption: {
    alignItems: 'center',
    margin: 8,
    width: 60,
  },
  colorSample: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'white',
  },
  colorName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#757575',
  },
});

export default SettingsScreen;