// components/map/LandmarkPreview.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/** Fiche d’aperçu pour un POI: montre nom, desc, estimations et actions. */
export default function LandmarkPreview({ poi, estimates, onConfirm, onConfirmAndStart, onClose }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{poi.label || poi.name}</Text>
      {!!poi.description && <Text style={styles.desc}>{poi.description}</Text>}

      {estimates ? (
        <View style={styles.row}>
          <Text style={styles.stat}>~ {estimates.km.toFixed(2)} km</Text>
          <Text style={styles.stat}>~ {estimates.minutes} min</Text>
          <Text style={styles.stat}>~ {estimates.steps} pas</Text>
        </View>
      ) : (
        <Text style={styles.hint}>Sélectionnez pour recalculer précisément l’itinéraire.</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFD941' }]} onPress={onConfirm}>
          <Text style={styles.btnTxt}>Confirmer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#4CAF50' }]} onPress={onConfirmAndStart}>
          <Text style={styles.btnTxt}>Confirmer & démarrer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#ccc' }]} onPress={onClose}>
          <Text style={[styles.btnTxt, { color: '#000' }]}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30 + 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 6,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  desc: { fontSize: 13, color: '#333', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stat: { fontSize: 13, fontWeight: '600', color: '#2D2D2D' },
  hint: { fontSize: 12, color: '#555', marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  btnTxt: { color: '#2D2D2D', fontWeight: 'bold' },
});
