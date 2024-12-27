import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function SimpleRoute() {
  const [origin] = useState({ latitude: 50.4674, longitude: 4.8718 }); // Départ : Namur
  const [destination] = useState({ latitude: 50.4679, longitude: 4.8765 }); // Destination fictive
  const [route, setRoute] = useState([]);

  // Fonction pour récupérer l'itinéraire depuis Google Directions API
  const fetchRoute = async () => {
    const apiKey = 'TON_API_KEY_GOOGLE_MAPS'; // Remplace par ta clé Google Maps API
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.routes.length) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRoute(points);
      } else {
        alert("Aucun itinéraire trouvé !");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'itinéraire :", error);
    }
  };

  // Fonction pour décoder la polyligne Google Maps
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let shift = 0, result = 0, b;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Marqueur de départ */}
        <Marker coordinate={origin} title="Départ" pinColor="green" />
        {/* Marqueur de destination */}
        <Marker coordinate={destination} title="Destination" pinColor="red" />
        {/* Itinéraire affiché par la polyligne */}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeColor="#FFD941" strokeWidth={4} />
        )}
      </MapView>

      {/* Bouton pour calculer et afficher l'itinéraire */}
      <TouchableOpacity style={styles.button} onPress={fetchRoute}>
        <Text style={styles.buttonText}>Afficher l'itinéraire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  button: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#FFD941',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#2D2D2D',
    fontWeight: 'bold',
  },
});
