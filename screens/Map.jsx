// Map.jsx
import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import SimpleRoute from '../components/SimpleRoute';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import POIList from '../components/POIList';
import { useSelector, useDispatch } from 'react-redux';
import { resetNavigation, togglePOI } from '../redux/slices/navigationSlice';

const MAPTILER_KEY = 'c85HpwKv5LkEDtV27XeH';
const API_BASE = 'http://192.168.0.44:3001';

export default function Map({ navigation }) {
  // trajet (calcul)
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  // POI cliqué en “aperçu” avant confirmation
  const [candidatePOI, setCandidatePOI] = useState(null);

  const dispatch = useDispatch();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  // 🔗 Redux
  const start = useSelector((s) => s.navigation.start);
  const end = useSelector((s) => s.navigation.end);
  const landmarks = useSelector((s) => s.navigation.landmarks);
  const selectedPOIs = useSelector((s) => s.navigation.selectedPOIs);
  const { token, user } = useSelector((s) => s.auth);

  // on considère “route démarrée” si on a un start + end
  const isRouteStarted = !!(start && end);

  // quand SimpleRoute calcule
  const onRouteCalculated = (coords, dist, dur) => {
    setRoute(coords);
    setDistance(dist);
    setDuration(dur);
  };

  const estimatedSteps = distance ? Math.round(distance / 0.75) : null;

  // Estimation rapide basée sur length_m renvoyé par /landmark/best
  const previewEstimates = useMemo(() => {
    if (!candidatePOI || !candidatePOI.length_m) return null;
    const m = Number(candidatePOI.length_m);
    const km = m / 1000;
    const steps = Math.round(m / 0.75);
    const minutes = Math.round((km * 60) / 5); // ~5 km/h
    return { m, km, steps, minutes };
  }, [candidatePOI]);

  const handleMarkerPress = (lm) => setCandidatePOI(lm);

  const confirmPOI = () => {
    if (!candidatePOI) return;
    if (selectedPOIs.length === 1 && selectedPOIs[0] === candidatePOI.id) {
      setCandidatePOI(null);
      return;
    }
    dispatch(resetNavigation());
    setTimeout(() => {
      dispatch(togglePOI(candidatePOI.id));
      setCandidatePOI(null);
    }, 0);
  };

  const confirmPOIAndStart = () => {
    if (!candidatePOI) return;
    if (!start || !end) {
      Alert.alert('Trajet incomplet', "Revenez à l'écran précédent pour définir départ et destination.");
      return;
    }
    dispatch(resetNavigation());
    setTimeout(() => {
      dispatch(togglePOI(candidatePOI.id));
      setCandidatePOI(null);
      // SimpleRoute recalculera automatiquement
    }, 0);
  };

  const resetDetour = () => {
    dispatch(resetNavigation());
    setCandidatePOI(null);
  };

  // ---- Envoi hardcodé des pas à l’API : POST puis fallback 409 -> GET last -> PATCH total ----
  const sendFixedSteps = async () => {
    if (!isRouteStarted) {
      Alert.alert('Trajet incomplet', "Revenez à l'écran précédent pour définir départ et destination.");
      return;
    }
    if (!token || !user?.id) {
      Alert.alert('Session', 'Veuillez vous reconnecter.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const FIXED_STEPS = 2500; // on envoie des PAS (pas des mètres)

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const baseBody = {
      id: user.id,
      log_date: today,
      distance_walked: FIXED_STEPS,
    };

    try {
      // 1) Tentative en POST (crée l’entrée du jour)
      let res = await fetch(`${API_BASE}/stepslog`, {
        method: 'POST',
        headers,
        body: JSON.stringify(baseBody),
      });

      if (res.status === 409) {
        // 2) Il existe déjà un log pour cette date → on récupère le dernier log de l'utilisateur
        let lastTotal = 0;
        try {
          const getRes = await fetch(
            `${API_BASE}/stepslog/${user.id}?limit=1&skip=0`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (getRes.ok) {
            const arr = await getRes.json();
            // on prend le premier si présent
            if (Array.isArray(arr) && arr.length > 0) {
              const last = arr[0];
              // certains back renvoient string → Number() pour être safe
              lastTotal = Number(last.distance_walked) || 0;
            }
          }
        } catch (_) {
          // si le GET échoue, on assume 0
          lastTotal = 0;
        }

        const newTotal = lastTotal + FIXED_STEPS;

        // 3) PATCH avec le nouveau total pour la date du jour
        res = await fetch(`${API_BASE}/stepslog`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            id: user.id,
            log_date: today,
            distance_walked: newTotal,
          }),
        });

        // Variante de secours : PATCH /stepslog/:id si nécessaire
        if (!res.ok) {
          res = await fetch(`${API_BASE}/stepslog/${user.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              log_date: today,
              distance_walked: newTotal,
            }),
          });
        }
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erreur API');
      }

      Alert.alert('Enregistré', `${FIXED_STEPS} pas ajoutés !`);
    } catch (e) {
      Alert.alert('Erreur', e.message || "Impossible d'enregistrer les pas.");
    }
  };
  // -------------------------------------------------------------------------------------------

  // région initiale
  const region =
    start
      ? {
          latitude: start.latitude,
          longitude: start.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: 50.4667,
          longitude: 4.867,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        {/* ✅ Tuiles MapTiler */}
        <UrlTile
          urlTemplate={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
          maximumZ={19}
          flipY={false}
          zIndex={0}
        />

        {/* Markers POI proposés */}
        {landmarks.map((lm) => {
          const isSelected = selectedPOIs.includes(lm.id);
          const title = lm.label || lm.name || 'Point';
          return (
            <Marker
              key={lm.id}
              coordinate={{
                latitude: parseFloat(lm.latitude),
                longitude: parseFloat(lm.longitude),
              }}
              title={title}
              description={lm.description}
              pinColor={isSelected ? '#ff9100ff' : '#d80404ff'}
              onPress={() => handleMarkerPress(lm)}
            />
          );
        })}

        {/* Start / End */}
        {start && <Marker coordinate={start} title="Départ" pinColor="green" />}
        {end && <Marker coordinate={end} title="Destination" pinColor="blue" />}

        {/* Route (quand dispo) */}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeColor="#FFD941" strokeWidth={4} />
        )}
      </MapView>

      {/* Barre d’actions en haut (évite chevauchements) */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FFD941' }]}
          onPress={() => navigation.navigate('RouteSetup')}
        >
          <Ionicons name="arrow-back" size={18} color="#2D2D2D" />
          <Text style={styles.actionText}>Changer le trajet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: currentTheme.cardColor }]}
          onPress={resetDetour}
        >
          <Ionicons name="refresh" size={18} color={currentTheme.textColor} />
          <Text style={[styles.actionText, { color: currentTheme.textColor }]}>
            Réinitialiser le détour
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des POI sélectionnés (sous la barre d’actions) */}
      <View style={{ marginTop: 70 }}>
        <POIList />
      </View>

      {/* Lancement + stats */}
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

      {/* Fiche d’aperçu du landmark */}
      {candidatePOI && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{candidatePOI.label || candidatePOI.name}</Text>
          {!!candidatePOI.description && (
            <Text style={styles.previewDesc}>{candidatePOI.description}</Text>
          )}
          {previewEstimates ? (
            <View style={styles.previewRow}>
              <Text style={styles.previewStat}>~ {previewEstimates.km.toFixed(2)} km</Text>
              <Text style={styles.previewStat}>~ {previewEstimates.minutes} min</Text>
              <Text style={styles.previewStat}>~ {previewEstimates.steps} pas</Text>
            </View>
          ) : (
            <Text style={styles.previewHint}>
              Sélectionnez pour recalculer précisément l’itinéraire.
            </Text>
          )}

          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={[styles.previewBtn, { backgroundColor: '#FFD941' }]}
              onPress={confirmPOI}
            >
              <Text style={styles.previewBtnText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewBtn, { backgroundColor: '#4CAF50' }]}
              onPress={confirmPOIAndStart}
            >
              <Text style={styles.previewBtnText}>Confirmer & démarrer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewBtn, { backgroundColor: '#ccc' }]}
              onPress={() => setCandidatePOI(null)}
            >
              <Text style={[styles.previewBtnText, { color: '#000' }]}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bouton flottant : envoyer 2500 pas */}
      {isRouteStarted && (
        <TouchableOpacity style={styles.fab} onPress={sendFixedSteps}>
          <Ionicons name="walk" size={18} color="#2D2D2D" />
          <Text style={styles.fabText}>Enregistrer 2500 pas</Text>
        </TouchableOpacity>
      )}

      {/* Mention MapTiler / OSM */}
      <View style={styles.attrib}>
        <Text style={styles.attribText}>© MapTiler © OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Barre d’actions en haut
  topActions: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 20 }),
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    elevation: 3,
  },
  actionText: {
    marginLeft: 6,
    fontWeight: 'bold',
    color: '#2D2D2D',
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

  // Fiche d’aperçu
  previewCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30 + 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 6,
  },
  previewTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  previewDesc: { fontSize: 13, color: '#333', marginBottom: 10 },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewStat: { fontSize: 13, fontWeight: '600', color: '#2D2D2D' },
  previewHint: { fontSize: 12, color: '#555', marginBottom: 12 },
  previewButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  previewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  previewBtnText: { color: '#2D2D2D', fontWeight: 'bold' },

  // FAB “enregistrer 2500 pas”
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 60,
    backgroundColor: '#FFD941',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    marginLeft: 6,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },

  // Attribution
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
