import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import SimpleRoute from '../components/SimpleRoute';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector } from 'react-redux';

export default function Map() {
  const [isRouteStarted, setIsRouteStarted] = useState(false);
  const [landmarks, setLandmarks] = useState([]);
  const [selectedPOIs, setSelectedPOIs] = useState([]);
  const [destination, setDestination] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchLandmarks = async () => {
      try {
        const response = await fetch('http://192.168.0.44:3001/landmark/all?limit=10&skip=0', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLandmarks(data);
        } else {
          Alert.alert('Erreur', `Code: ${response.status}`);
        }
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de charger les points d’intérêt.');
      }
    };

    fetchLandmarks();
  }, []);

  const handleStartRoute = () => {
    if (!destination) {
      Alert.alert("Erreur", "Veuillez d'abord entrer une destination.");
      return;
    }
    setIsRouteStarted(true);
  };

  const handleStopRoute = () => {
    setIsRouteStarted(false);
    setDestination(null);
    setSearchInput('');
  };

  const togglePOI = (poiId) => {
    setSelectedPOIs((prev) =>
      prev.includes(poiId)
        ? prev.filter((id) => id !== poiId)
        : [...prev, poiId]
    );
  };

  const handleGeocode = async () => {
    if (!searchInput.trim()) {
      Alert.alert("Erreur", "Entrez une adresse ou des coordonnées.");
      return;
    }

    let query = encodeURIComponent(searchInput);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'WalkThroughApp/1.0 (email@example.com)' // Obligatoire pour Nominatim
        }
      });
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        setDestination({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
      } else {
        Alert.alert("Erreur", "Aucune correspondance trouvée.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Échec de la géolocalisation.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {!isRouteStarted ? (
        <View style={styles.centeredContainer}>
          <Text style={[styles.title, { color: currentTheme.textColor }]}>
            Entrez une destination ou appuyez sur un POI
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#fff' }]}
            placeholder="Ex : Rue de Namur 32, Bruxelles"
            value={searchInput}
            onChangeText={setSearchInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.cardColor }]}
            onPress={handleGeocode}
          >
            <Text style={{ color: currentTheme.activeColor, fontWeight: 'bold' }}>
              Chercher la destination
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.cardColor, marginTop: 10 }]}
            onPress={handleStartRoute}
          >
            <Text style={{ color: currentTheme.activeColor, fontWeight: 'bold' }}>
              Commencer le trajet
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: destination?.latitude || 50.4667,
              longitude: destination?.longitude || 4.867,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {landmarks.map((lm) => (
              <Marker
                key={lm.id}
                coordinate={{ latitude: lm.latitude, longitude: lm.longitude }}
                title={lm.name}
                description={lm.description}
                pinColor={selectedPOIs.includes(lm.id) ? 'orange' : 'red'}
                onPress={() => togglePOI(lm.id)}
              />
            ))}
            {destination && (
              <Marker
                coordinate={destination}
                title="Destination"
                pinColor="blue"
              />
            )}
          </MapView>
          <SimpleRoute selectedPOIs={selectedPOIs} destination={destination} />
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: currentTheme.cardColor }]}
            onPress={handleStopRoute}
          >
            <Ionicons name="settings" size={24} color={currentTheme.textColor} />
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
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
