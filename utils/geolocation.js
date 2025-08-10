import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const geocodeInput = async (input, fallbackToGps = false) => {
  if (!input.trim() && fallbackToGps) {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Erreur", "Permission GPS refusée.");
        return null;
      }
      let location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      Alert.alert("Erreur", "Localisation impossible.");
      return null;
    }
  }

  const regex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const match = input.match(regex);
  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[3]),
    };
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WalkThroughApp/1.0 (email@example.com)' }
    });
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } else {
      Alert.alert("Erreur", "Aucune correspondance trouvée.");
      return null;
    }
  } catch (err) {
    Alert.alert("Erreur", "Échec de la géolocalisation.");
    return null;
  }
};

export const getUserLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Erreur", "Permission GPS refusée.");
      return null;
    }

    let location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    Alert.alert("Erreur", "Impossible de récupérer votre position.");
    return null;
  }
};