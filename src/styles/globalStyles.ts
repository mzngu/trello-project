import { StyleSheet } from 'react-native';
import colors from './color';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header styles
  header: {
    height: 50,
    backgroundColor: colors.header,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 30,
  },
  menuIcon: {
    fontSize: 22,
  },
  headerRight: {
    width: 50,
  },
  headerRightText: {
    fontSize: 12,
    color: '#1565c0',
  },
  
  // Content styles
  content: {
    flex: 1,
    padding: 15,
  },
  contentTitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  
  // Form styles
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 5,
    padding: 15,
    marginTop: 10,
  },
  formHeader: {
    backgroundColor: colors.accent,
    padding: 10,
    marginBottom: 15,
  },
  formHeaderText: {
    color: colors.textLight,
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 3,
    padding: 10,
    fontSize: 14,
  },
  
  // Button styles
  actionButton: {
    backgroundColor: colors.buttonPrimary,
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  bottomButton: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  bottomButtonText: {
    color: colors.textLight,
    fontSize: 12,
  },
  
  // Table list styles
  tableList: {
    marginTop: 10,
  },
  tableItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 3,
  },
  tableText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  
  // Settings styles
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
    borderBottomColor: '#90a4ae',
    paddingVertical: 3,
    fontSize: 14,
  },
});