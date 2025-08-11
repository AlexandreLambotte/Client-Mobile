// screens/RouteSetup.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLandmarks, setStart, setEnd } from '../redux/slices/navigationSlice';
import { geocodeInput } from '../utils/geolocation';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = process.env.API_BASE;

export default function RouteSetup({ navigation }) {
  const [steps, setSteps] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  // 🎨 Thème
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Authentification requise', 'Veuillez vous reconnecter.');
      return;
    }

    const stepsNum = parseInt(String(steps).trim(), 10);
    if (!Number.isFinite(stepsNum) || stepsNum <= 0) {
      Alert.alert('Erreur', 'Veuillez indiquer un nombre de pas valide.');
      return;
    }
    const distanceMeters = Math.round(stepsNum * 0.75); // ~0.75 m/pas

    const origin = await geocodeInput(startAddress, true);
    if (!origin) {
      Alert.alert('Erreur', "Impossible de déterminer le point de départ (adresse/GPS).");
      return;
    }

    if (!destAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer une adresse de destination.');
      return;
    }
    const destination = await geocodeInput(destAddress, false);
    if (!destination) {
      Alert.alert('Erreur', 'Adresse de destination introuvable.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/landmark/best`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressLongDep: Number(origin.longitude),
          addressLatDep: Number(origin.latitude),
          addressLongArr: Number(destination.longitude),
          addressLatArr: Number(destination.latitude),
          distance: distanceMeters,
          tolerance: 0,
          limit: 3,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erreur API');
      }

      const bestLandmarks = await res.json();

      dispatch(setStart({ latitude: origin.latitude, longitude: origin.longitude }));
      dispatch(setEnd({ latitude: destination.latitude, longitude: destination.longitude }));
      dispatch(setLandmarks(bestLandmarks));

      navigation.navigate('Map');
    } catch (err) {
      if ((err.message || '').toLowerCase().includes('nojwt')) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
      } else {
        Alert.alert('Erreur', err.message || 'Impossible de récupérer les landmarks.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.inner, { backgroundColor: currentTheme.backgroundColor }]}>
          <Text style={[styles.title, { color: currentTheme.textColor }]}>Préparer votre trajet</Text>

          <Text style={[styles.label, { color: currentTheme.textColor }]}>Nombre de pas</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: currentTheme.cardColor, color: currentTheme.textColor, borderColor: currentTheme.cardColor },
            ]}
            value={steps}
            onChangeText={setSteps}
            keyboardType="numeric"
            placeholder="Ex: 2000"
            placeholderTextColor="#999"
          />

          <Text style={[styles.label, { color: currentTheme.textColor }]}>Point de départ (adresse)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: currentTheme.cardColor, color: currentTheme.textColor, borderColor: currentTheme.cardColor },
            ]}
            placeholder="Laissez vide pour utiliser votre position"
            placeholderTextColor="#999"
            value={startAddress}
            onChangeText={setStartAddress}
          />

          <Text style={[styles.label, { color: currentTheme.textColor }]}>Destination (adresse)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: currentTheme.cardColor, color: currentTheme.textColor, borderColor: currentTheme.cardColor },
            ]}
            placeholder="Adresse d'arrivée"
            placeholderTextColor="#999"
            value={destAddress}
            onChangeText={setDestAddress}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FFD941' }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.buttonText, { color: '#2D2D2D' }]}>
              Trouver les meilleurs landmarks
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 20, justifyContent: 'center' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: { fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 18,
    alignItems: 'center',
  },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
});
