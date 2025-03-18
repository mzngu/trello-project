FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installation des dépendances globales
RUN npm install -g expo-cli react-native-cli

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances avec legacy-peer-deps pour résoudre les conflits
RUN npm install --legacy-peer-deps

# Copier le reste du projet
COPY . .

# Exposer les ports nécessaires pour Expo/React Native
EXPOSE 19000 19001 19002 8081

# Commande par défaut
CMD ["npm", "start"]