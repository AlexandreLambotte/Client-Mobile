import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import SimpleRoute from '../components/SimpleRoute';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext'; // Importation du contexte

export default function Map() {
  const [isRouteStarted, setIsRouteStarted] = useState(false); // Gère si le trajet a commencé
  const { theme, themes } = useTheme(); // Récupération du thème actuel
  const currentTheme = themes[theme];

  const handleStartRoute = () => setIsRouteStarted(true);
  const handleStopRoute = () => setIsRouteStarted(false);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {!isRouteStarted ? (
        // Avant le trajet
        <View style={styles.centeredContainer}>
          <Text style={[styles.title, { color: currentTheme.textColor }]}>
            Appuyez pour commencer un trajet
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.cardColor }]}
            onPress={handleStartRoute}
          >
            <Text style={{ color: currentTheme.activeColor, fontWeight: 'bold' }}>
              Commencer le trajet
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Pendant le trajet
        <>
          <SimpleRoute />
          <TouchableOpacity
            style={[
              styles.settingsButton,
              { backgroundColor: currentTheme.cardColor },
            ]}
            onPress={handleStopRoute}
          >
            <Ionicons name="ios-settings" size={24} color={currentTheme.textColor} />
            <Text style={{ marginLeft: 8, color: currentTheme.textColor }}>
              Arrêter le trajet
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
});
