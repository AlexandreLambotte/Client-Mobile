import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

export default function SimpleRoute() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [input, setInput] = useState('');

  // Récupération position actuelle
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', "L'application a besoin de la géolocalisation pour fonctionner.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Résolution d'adresse vers coordonnées
  const resolveDestination = async () => {
    // Coordonnées GPS directes ?
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = input.match(coordRegex);

    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[3]);
      setDestination({ latitude, longitude });
      return { latitude, longitude };
    }

    // Sinon, géocodage avec Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const resolved = { latitude: lat, longitude: lon };
        setDestination(resolved);
        return resolved;
      } else {
        Alert.alert('Adresse introuvable', 'Aucune correspondance trouvée.');
        return null;
      }
    } catch (error) {
      console.error('Erreur Nominatim:', error);
      Alert.alert("Erreur", "Impossible de résoudre l’adresse.");
      return null;
    }
  };

  // Calcul d’itinéraire
  const fetchRoute = async () => {
    if (!origin) return;

    const finalDest = await resolveDestination();
    if (!finalDest) return;

    try {
      const response = await fetch(
        'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
        {
          method: 'POST',
          headers: {
            Authorization: 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA0ZmE5YWY5N2M4NjQwNjU5ODFiNWM1OWEzNjczMzY2IiwiaCI6Im11cm11cjY0In0=',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [
              [origin.longitude, origin.latitude],
              [finalDest.longitude, finalDest.latitude],
            ],
          }),
        }
      );

      const data = await response.json();
      const coords = data.features[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
      setRoute(coords);

      const { distance, duration } = data.features[0].properties.summary;
      setDistance(distance);
      setDuration(duration);
    } catch (error) {
      console.error("Erreur OpenRouteService:", error);
      Alert.alert("Erreur", "Impossible de récupérer l'itinéraire.");
    }
  };

  const estimatedSteps = distance ? Math.round(distance / 0.75) : null;

  return (
    <View style={styles.container}>
      {origin && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: origin.latitude,
            longitude: origin.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <UrlTile
            urlTemplate="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=c85HpwKv5LkEDtV27XeH"
            maximumZ={19}
            flipY={false}
          />
          <Marker coordinate={origin} title="Départ" pinColor="green" />
          {destination && <Marker coordinate={destination} title="Destination" pinColor="red" />}
          {route.length > 0 && (
            <Polyline coordinates={route} strokeColor="#FFD941" strokeWidth={4} />
          )}
        </MapView>
      )}

      {/* Entrée destination */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Adresse ou coordonnées (lat,lon)"
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.searchButton} onPress={fetchRoute}>
          <Text style={styles.buttonText}>GO</Text>
        </TouchableOpacity>
      </View>

      {/* Infos */}
      {distance && duration && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Distance : {(distance / 1000).toFixed(2)} km</Text>
          <Text style={styles.infoText}>Durée : {Math.ceil(duration / 60)} min</Text>
          <Text style={styles.infoText}>Pas estimés : {estimatedSteps}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  inputBox: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    color: '#000',
  },
  searchButton: {
    padding: 10,
    backgroundColor: '#FFD941',
    borderRadius: 5,
  },
  buttonText: {
    color: '#2D2D2D',
    fontWeight: 'bold',
  },
  infoBox: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#ffffffcc',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
  },
});
