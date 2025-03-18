import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const RegisterScreen = () => {
  const websiteUrl = 'https://id.atlassian.com/signup?prompt=login&continue=https%3A%2F%2Ftrello.com%2Flogout%3Fdsc%3D0949957ec764bc381e36479baec3f1cbbfd4558ed82d9300adcd5ca7d870ee07'; // Change this to your target URL
  
  return (
    <WebView 
      source={{ uri: websiteUrl }}
      style={{ flex: 1 }}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Redirecting to website...</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16
  }
});

export default RegisterScreen;