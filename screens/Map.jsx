import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function Map({ navigation }) {
  // États pour gérer les données utilisateur et l'état de l'écran
  const [isRouteStarted, setIsRouteStarted] = useState(false);
  const [destination, setDestination] = useState('');
  const [steps, setSteps] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [navigationInfo, setNavigationInfo] = useState({
    distance: 800, // Distance initiale (statique au départ)
    direction: 'Tourner à gauche', // Instruction initiale
  });

  // Simuler une fonction pour ajuster un itinéraire
  const adjustRoute = async (start, end, desiredSteps) => {
    const stepLength = 0.8; // Longueur moyenne d'un pas en mètres
    const desiredDistance = desiredSteps * stepLength; // Distance en mètres demandée

    // Coordonnées de base (Namur et un point statique)
    const baseRoute = [
      { latitude: 50.4674, longitude: 4.8718 }, // Départ (Namur)
      { latitude: 50.4679, longitude: 4.8765 }, // Exemple de destination
    ];

    const baseDistance = 500; // Distance simulée en mètres pour cet itinéraire statique

    if (baseDistance >= desiredDistance) {
      // Si l'itinéraire de base est suffisant
      return baseRoute;
    } else {
      // Calculer les points supplémentaires (ajouter un détour)
      const extraDistance = desiredDistance - baseDistance;

      // Simuler l'ajout de waypoints pour prolonger le trajet
      const extendedRoute = [
        ...baseRoute,
        { latitude: 50.4690, longitude: 4.8725 }, // Exemple de détour
        { latitude: 50.4679, longitude: 4.8765 }, // Revenir à la destination finale
      ];

      return extendedRoute;
    }
  };

  const startRoute = async () => {
    if (!destination || !steps) {
      Alert.alert('Erreur', 'Veuillez entrer une destination et un nombre de pas.');
      return;
    }

    try {
      // Simuler l'ajustement de l'itinéraire
      const adjustedRoute = await adjustRoute(
        { latitude: 50.4674, longitude: 4.8718 },
        { latitude: 50.4679, longitude: 4.8765 },
        parseInt(steps, 10)
      );

      // Mettre à jour l'état avec le nouvel itinéraire
      setRouteCoordinates(adjustedRoute);
      setIsRouteStarted(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de calculer le trajet.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Carte interactive */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 50.4674, // Latitude de Namur
          longitude: 4.8718, // Longitude de Namur
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Marqueur sur Namur */}
        <Marker coordinate={{ latitude: 50.4674, longitude: 4.8718 }} title="Namur" />
        {/* Afficher le trajet si le route est commencée */}
        {isRouteStarted && (
          <>
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#FFD941"
              strokeWidth={4}
            />
            {/* Marqueur pour la destination */}
            <Marker
              coordinate={routeCoordinates[routeCoordinates.length - 1]}
              title="Destination"
            />
          </>
        )}
      </MapView>

      {/* Écran de saisie ou d'itinéraire */}
      {isRouteStarted ? (
        // Afficher l'écran de navigation
        <View style={styles.routeInfo}>
          {/* Instruction box en haut à gauche */}
          <View style={styles.instructionBox}>
            <FontAwesome5 name="arrow-left" size={20} color="#FFD941" />
            <View style={styles.instructionText}>
              <Text style={styles.distance}>{navigationInfo.distance} m</Text>
              <Text style={styles.direction}>{navigationInfo.direction}</Text>
            </View>
          </View>

          {/* Bouton d'options (options supplémentaires à ajouter) */}
          <TouchableOpacity style={styles.optionsButton}>
            <Ionicons name="options" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        // Afficher l'écran de saisie des données utilisateur
        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            <Ionicons name="search" size={20} color="white" />
            <TextInput
              style={styles.input}
              placeholder="Adresse de destination"
              placeholderTextColor="#777"
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="footsteps" size={20} color="white" />
            <TextInput
              style={styles.input}
              placeholder="Nombre de pas"
              placeholderTextColor="#777"
              keyboardType="numeric"
              value={steps}
              onChangeText={setSteps}
            />
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startRoute}>
            <Text style={styles.startButtonText}>Commencer mes pas</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  inputContainer: {
    position: 'absolute',
    bottom: 90,
    left: 10,
    right: 10,
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 15,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    paddingLeft: 10,
  },
  startButton: {
    backgroundColor: '#FFD941',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  startButtonText: { fontWeight: 'bold', color: '#2D2D2D' },
  routeInfo: {
    position: 'absolute',
    bottom: 90,
    left: 10,
    right: 10,
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 15,
  },
  instructionBox: {
    position: 'absolute',
    top: 50,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
  },
  instructionText: { marginLeft: 10 },
  distance: { color: '#FFD941', fontSize: 18, fontWeight: 'bold' },
  direction: { color: 'white', fontSize: 14 },
  optionsButton: {
    position: 'absolute',
    top: -40,
    right: 10,
    backgroundColor: '#FFD941',
    padding: 10,
    borderRadius: 20,
  },
});
