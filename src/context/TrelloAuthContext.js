import React, { createContext, useContext } from 'react';
import useTrelloAuth from '../hooks/useTrelloAuth';

// creer le context
const TrelloAuthContext = createContext(null);

// component pour le context provider
export const TrelloAuthProvider = ({ children }) => {
  const auth = useTrelloAuth();
  
  return (
    <TrelloAuthContext.Provider value={auth}>
      {children}
    </TrelloAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useTrelloAuthContext = () => {
  const context = useContext(TrelloAuthContext);
  
  if (!context) {
    throw new Error('useTrelloAuthContext must be used within a TrelloAuthProvider');
  }
  
  return context;
};