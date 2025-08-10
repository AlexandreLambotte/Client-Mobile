import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import SimpleRoute from '../components/SimpleRoute';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { geocodeInput, getUserLocation } from '../utils/geolocation';
import POIList from '../components/POIList';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchLandmarksThunk,
  resetNavigation,
  togglePOI,
} from '../redux/slices/navigationSlice';

export default function Map() {
  const [isRouteStarted, setIsRouteStarted] = useState(false);
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const dispatch = useDispatch();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const { token } = useSelector((state) => state.auth);
  const landmarks = useSelector((state) => state.navigation.landmarks);
  const selectedPOIs = useSelector((state) => state.navigation.selectedPOIs);

  useEffect(() => {
    dispatch(fetchLandmarksThunk(token));
  }, [dispatch, token]);

  useEffect(() => {
    const loadUserLocation = async () => {
      const location = await getUserLocation();
      if (location) setOriginCoords(location);
    };

    loadUserLocation();
  }, []);

  const handleStartRoute = async () => {
    const origin = await geocodeInput(originInput, true);
    const destination = await geocodeInput(destinationInput, false);

    if (!destination) {
      Alert.alert('Erreur', 'Veuillez entrer une destination valide.');
      return;
    }

    setOriginCoords(origin);
    setDestinationCoords(destination);
    setRoute([]);
    setDistance(null);
    setDuration(null);
    setIsRouteStarted(true);
  };

  const handleStopRoute = () => {
    setIsRouteStarted(false);
    setOriginInput('');
    setDestinationInput('');
    setOriginCoords(null);
    setDestinationCoords(null);
    dispatch(resetNavigation());
    setRoute([]);
    setDistance(null);
    setDuration(null);
  };

  const onRouteCalculated = (coords, dist, dur) => {
    setRoute(coords);
    setDistance(dist);
    setDuration(dur);
  };

  const estimatedSteps = distance ? Math.round(distance / 0.75) : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <MapView
            style={styles.map}
            showsUserLocation={true}
            region={
              originCoords
                ? {
                    latitude: originCoords.latitude,
                    longitude: originCoords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }
                : {
                    latitude: 50.4667,
                    longitude: 4.867,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }
            }
          >
            {landmarks.map((lm) => {
              const isSelected = selectedPOIs.includes(lm.id);
              return (
                <Marker
                  key={lm.id}
                  coordinate={{
                    latitude: parseFloat(lm.latitude),
                    longitude: parseFloat(lm.longitude),
                  }}
                  title={lm.name}
                  description={lm.description}
                  pinColor={isSelected ? '#ff9100ff' : '#d80404ff'}
                  onPress={() => dispatch(togglePOI(lm.id))}
                />
              );
            })}
            {originCoords && (
              <Marker coordinate={originCoords} title="Départ" pinColor="green" />
            )}
            {destinationCoords && (
              <Marker coordinate={destinationCoords} title="Destination" pinColor="blue" />
            )}
            {route.length > 0 && (
              <Polyline coordinates={route} strokeColor="#FFD941" strokeWidth={4} />
            )}
          </MapView>

          {/* ✅ POIList Redux (plus de props nécessaires) */}
          <POIList />

          {!isRouteStarted ? (
            <View style={styles.controls}>
              <Text style={[styles.title, { color: currentTheme.textColor }]}>
                Définir votre trajet
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Point de départ (adresse ou lat,lon)"
                value={originInput}
                onChangeText={setOriginInput}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="Destination (adresse ou lat,lon)"
                value={destinationInput}
                onChangeText={setDestinationInput}
                placeholderTextColor="#999"
              />
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
            <>
              <SimpleRoute
                origin={originCoords}
                destination={destinationCoords}
                selectedPOIs={landmarks.filter((lm) =>
                  selectedPOIs.includes(lm.id)
                )}
                onRouteCalculated={onRouteCalculated}
              />
              <TouchableOpacity
                style={[styles.settingsButton, { backgroundColor: currentTheme.cardColor }]}
                onPress={handleStopRoute}
              >
                <Ionicons name="settings" size={24} color={currentTheme.textColor} />
                <Text style={{ marginLeft: 8, color: currentTheme.textColor }}>
                  Arrêter le trajet
                </Text>
              </TouchableOpacity>
              {distance && duration && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Distance : {(distance / 1000).toFixed(2)} km
                  </Text>
                  <Text style={styles.infoText}>
                    Durée : {Math.ceil(duration / 60)} min
                  </Text>
                  <Text style={styles.infoText}>Pas estimés : {estimatedSteps}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#ffffffee',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    color: '#000',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
  poiList: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#ffffffee',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  poiTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
    color: '#2D2D2D',
  },
  poiItem: {
    fontSize: 13,
    color: '#2D2D2D',
    marginBottom: 4,
  },
  poiRemove: {
    color: '#d80404ff',
    fontWeight: 'bold',
  },
});
