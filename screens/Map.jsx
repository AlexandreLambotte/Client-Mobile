import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import { resetNavigation, togglePOI } from '../redux/slices/navigationSlice';
import SimpleRoute from '../components/SimpleRoute';
import POIList from '../components/POIList';
import LandmarkPreview from '../components/map/LandmarkPreview';
import TopActions from '../components/map/TopActions';
import { sendFixedSteps } from '../services/stepslog';
import { saveFavoriteRoute } from '../services/favroute';
import { useRoute } from '@react-navigation/native';

const MAPTILER_KEY = 'c85HpwKv5LkEDtV27XeH';
const API_BASE = process.env.API_BASE;

export default function Map({ navigation }) {
  // Polyline + ORS complet (pour sauvegarde trajet)
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [fullORS, setFullORS] = useState(null);

  // Aperçu POI + UI
  const [candidatePOI, setCandidatePOI] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showUpdated, setShowUpdated] = useState(false);

  // Démarrage/arrêt du trajet (contrôle UI)
  const [isRunning, setIsRunning] = useState(false);

  // Thème + store
  const dispatch = useDispatch();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const start = useSelector((s) => s.navigation.start);
  const end = useSelector((s) => s.navigation.end);
  const landmarks = useSelector((s) => s.navigation.landmarks);
  const selectedPOIs = useSelector((s) => s.navigation.selectedPOIs);
  const { token, user } = useSelector((s) => s.auth);

  const isRouteStarted = !!(start && end);

  // Récupère un éventuel favori passé depuis RouteSetup
  const { params } = useRoute();
  useEffect(() => {
    const fav = params?.favoriteRoute;
    if (fav?.coords?.length) {
      setRoute(fav.coords);
      // on laisse SimpleRoute recalc quand même (pour durée/distance exactes),
      // mais on affiche déjà la polyline du favori
    }
  }, [params?.favoriteRoute]);

  const onRouteCalculated = (coords, dist, dur, ors) => {
    setRoute(coords);
    setDistance(dist);
    setDuration(dur);
    setFullORS(ors || null);
    if (isCalculating) setIsCalculating(false);
    setShowUpdated(true);
    setTimeout(() => setShowUpdated(false), 1500);
  };

  // Estimations
  const estimatedSteps = distance ? Math.round(distance / 0.75) : null;
  const previewEstimates = useMemo(() => {
    if (!candidatePOI?.length_m) return null;
    const m = Number(candidatePOI.length_m);
    const km = m / 1000;
    const steps = Math.round(m / 0.75);
    const minutes = Math.round((km * 60) / 5);
    return { m, km, steps, minutes };
  }, [candidatePOI]);

  // POI preview
  const handleMarkerPress = (lm) => setCandidatePOI(lm);
  const confirmPOICommon = () => {
    if (!candidatePOI) return;
    if (selectedPOIs.length === 1 && selectedPOIs[0] === candidatePOI.id) {
      setCandidatePOI(null);
      return;
    }
    setIsCalculating(true);
    dispatch(resetNavigation());
    setTimeout(() => {
      dispatch(togglePOI(candidatePOI.id));
      setCandidatePOI(null);
    }, 0);
  };
  const confirmPOI = () => confirmPOICommon();
  const confirmPOIAndStart = () => {
    if (!start || !end) {
      Alert.alert('Trajet incomplet', "Définissez d'abord le départ et la destination.");
      return;
    }
    confirmPOICommon();
    setIsRunning(true);
  };
  const resetDetour = () => {
    dispatch(resetNavigation());
    setCandidatePOI(null);
  };

  // Start/Stop
  const onStartTrip = () => {
    if (!isRouteStarted) {
      Alert.alert('Trajet incomplet', "Définissez d'abord départ et destination.");
      return;
    }
    setIsRunning(true);
  };
  const onStopTrip = () => {
    setIsRunning(false);
  };

  // API : 2500 pas + favoris
  const onSendSteps = async () => {
    if (!isRouteStarted) {
      Alert.alert('Trajet incomplet', "Définissez d'abord départ et destination.");
      return;
    }
    try {
      await sendFixedSteps({ token, user, apiBase: API_BASE, steps: 2500 });
      Alert.alert('Enregistré', '2500 pas ajoutés !');
    } catch (e) {
      Alert.alert('Erreur', e.message || "Impossible d'enregistrer les pas.");
    }
  };
  const onSaveRoute = async () => {
    if (!isRouteStarted || !route.length || !fullORS) {
      Alert.alert('Trajet', 'Aucun trajet à enregistrer.');
      return;
    }
    try {
      await saveFavoriteRoute({ token, user, apiBase: API_BASE, ors: fullORS, polyline: route });
      Alert.alert('Succès', 'Trajet enregistré comme favori.');
    } catch (e) {
      Alert.alert('Erreur', e.message || "Impossible d'enregistrer le trajet.");
    }
  };

  // Région initiale
  const region = start
    ? { latitude: start.latitude, longitude: start.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 50.4667, longitude: 4.867, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} showsUserLocation>
        <UrlTile
          urlTemplate={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
          maximumZ={19}
          flipY={false}
          zIndex={0}
        />

        {landmarks.map((lm) => {
          const isSelected = selectedPOIs.includes(lm.id);
          const title = lm.label || lm.name || 'Point';
          return (
            <Marker
              key={lm.id}
              coordinate={{ latitude: parseFloat(lm.latitude), longitude: parseFloat(lm.longitude) }}
              title={title}
              description={lm.description}
              pinColor={isSelected ? '#ff9100ff' : '#d80404ff'}
              onPress={() => handleMarkerPress(lm)}
            />
          );
        })}

        {start && <Marker coordinate={start} title="Départ" pinColor="green" />}
        {end && <Marker coordinate={end} title="Destination" pinColor="blue" />}

        {route.length > 0 && <Polyline coordinates={route} strokeColor="#FFD941" strokeWidth={4} />}
      </MapView>

      <TopActions
        onChangeRoute={() => navigation.navigate('RouteSetup')}
        onResetDetour={resetDetour}
        theme={currentTheme}
      />

      <View style={{ marginTop: 70 }}>
        <POIList />
      </View>

      {isRouteStarted && (
        <>
          <SimpleRoute origin={start} destination={end} onRouteCalculated={onRouteCalculated} />
          {distance && duration && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Distance : {(distance / 1000).toFixed(2)} km</Text>
              <Text style={styles.infoText}>Durée : {Math.ceil(duration / 60)} min</Text>
              <Text style={styles.infoText}>Pas estimés : {estimatedSteps}</Text>
            </View>
          )}
        </>
      )}

      {candidatePOI && (
        <LandmarkPreview
          poi={candidatePOI}
          estimates={previewEstimates}
          onConfirm={confirmPOI}
          onConfirmAndStart={confirmPOIAndStart}
          onClose={() => setCandidatePOI(null)}
        />
      )}

      {isRouteStarted && (
        <>
          {/* Démarrer / Stopper */}
          {!isRunning ? (
            <TouchableOpacity style={[styles.fab, { bottom: 164 }]} onPress={onStartTrip}>
              <Ionicons name="play" size={18} color="#2D2D2D" />
              <Text style={styles.fabText}>Démarrer le trajet</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.fab, { bottom: 164, backgroundColor: '#FF8585' }]} onPress={onStopTrip}>
              <Ionicons name="stop" size={18} color="#2D2D2D" />
              <Text style={styles.fabText}>Stopper le trajet</Text>
            </TouchableOpacity>
          )}

          {/* 2500 pas */}
          <TouchableOpacity style={[styles.fab, { bottom: 60 }]} onPress={onSendSteps}>
            <Ionicons name="walk" size={18} color="#2D2D2D" />
            <Text style={styles.fabText}>Enregistrer 2500 pas</Text>
          </TouchableOpacity>

          {/* Enregistrer trajet */}
          <TouchableOpacity style={[styles.fab, { bottom: 112 }]} onPress={onSaveRoute}>
            <Ionicons name="save" size={18} color="#2D2D2D" />
            <Text style={styles.fabText}>Enregistrer ce trajet</Text>
          </TouchableOpacity>
        </>
      )}

      {isCalculating && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#2D2D2D" />
          <Text style={styles.loaderText}>Calcul de l’itinéraire…</Text>
        </View>
      )}

      {showUpdated && (
        <View style={styles.updatedBanner}>
          <Text style={styles.updatedText}>Itinéraire mis à jour</Text>
        </View>
      )}

      <View style={styles.attrib}>
        <Text style={styles.attribText}>© MapTiler © OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // décalée pour ne pas être masquée par les FABs
  infoBox: {
    position: 'absolute',
    bottom: 220,
    left: 20,
    right: 20,
    backgroundColor: '#ffffffcc',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: { fontSize: 16, fontWeight: '600', color: '#2D2D2D' },

  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFD941',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: { marginLeft: 6, fontWeight: 'bold', color: '#2D2D2D' },

  loaderOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#00000033',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: { marginTop: 10, color: '#2D2D2D', fontWeight: '600' },

  updatedBanner: {
    position: 'absolute',
    top: Platform.select({ ios: 90, android: 60 }),
    alignSelf: 'center',
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  updatedText: { color: '#FFD941', fontWeight: '700' },

  attrib: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: '#ffffffcc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  attribText: { fontSize: 10, color: '#333' },
});
