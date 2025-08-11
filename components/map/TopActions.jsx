// components/map/TopActions.jsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/** Affiche les actions globales de la carte (changer le trajet, réinitialiser le détour). */
export default function TopActions({ onChangeRoute, onResetDetour, theme }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFD941' }]} onPress={onChangeRoute}>
        <Ionicons name="arrow-back" size={18} color="#2D2D2D" />
        <Text style={styles.text}>Changer le trajet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: theme.cardColor }]} onPress={onResetDetour}>
        <Ionicons name="refresh" size={18} color={theme.textColor} />
        <Text style={[styles.text, { color: theme.textColor }]}>Réinitialiser le détour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 20 }),
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    elevation: 3,
  },
  text: { marginLeft: 6, fontWeight: 'bold', color: '#2D2D2D' },
});
