import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLandmarks, setStart, setEnd, resetNavigation } from '../redux/slices/navigationSlice';
import { geocodeInput } from '../utils/geolocation';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = process.env.API_BASE;

export default function RouteSetup({ navigation }) {
  // ------- État "nouveau trajet" -------
  const [steps, setSteps] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');

  // ------- État favoris -------
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [favs, setFavs] = useState([]); // [{label, coords, landmarkId, routeId}]
  const [deletingId, setDeletingId] = useState(null); // routeId en cours de suppression

  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  // Thème
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const metersFromSteps = (s) => Math.round(Number(s) * 0.75);

  // ------- Soumission “meilleurs landmarks” -------
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
    const distanceMeters = metersFromSteps(stepsNum);

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

      dispatch(resetNavigation());
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

  const fetchAddressLabel = async (addressId) => {
    try {
      const r = await fetch(`${API_BASE}/address/${addressId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!r.ok) return `Adresse ${addressId}`;
      const a = await r.json();
      const street = a?.street || '';
      const number = a?.number ? ` ${a.number}` : '';
      const city = a?.city ? `, ${a.city}` : '';
      const composed = `${street}${number}${city}`.trim();
      return composed || `Adresse ${addressId}`;
    } catch {
      return `Adresse ${addressId}`;
    }
  };

  const fetchRouteChain = async (firstId) => {
    const segments = [];
    let current = firstId;
    const guard = new Set();

    while (current != null) {
      if (guard.has(current)) break;
      guard.add(current);

      const r = await fetch(`${API_BASE}/route/${current}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!r.ok) break;

      const seg = await r.json();
      segments.push(seg);
      current = seg?.next_segment ?? null;
    }

    segments.reverse();

    const coords = [];
    segments.forEach((s, idx) => {
      const sp = { latitude: Number(s.start_point_lat), longitude: Number(s.start_point_long) };
      const ep = { latitude: Number(s.end_point_lat), longitude: Number(s.end_point_long) };
      if (idx === 0) coords.push(sp);
      coords.push(ep);
    });

    return { segments, coords };
  };

  const fetchFavorites = async () => {
    if (!user?.id) return;
    setLoadingFavs(true);
    try {
      const r = await fetch(`${API_BASE}/favroute/${user.id}?limit=3&skip=0`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!r.ok) throw new Error(`Erreur favoris (${r.status})`);
      const rows = await r.json();

      const enriched = [];
      for (const fr of rows) {
        const [startLabel, endLabel, chain] = await Promise.all([
          fetchAddressLabel(fr.start_address),
          fetchAddressLabel(fr.end_address),
          fetchRouteChain(fr.route_id),
        ]);

        enriched.push({
          label: `${startLabel} - ${endLabel}`,
          coords: chain.coords || [],
          landmarkId: fr.landmark_id ?? null,
          routeId: fr.route_id,
        });
      }
      setFavs(enriched);
    } catch (e) {
      Alert.alert('Favoris', e.message || 'Impossible de charger vos trajets favoris.');
    } finally {
      setLoadingFavs(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user?.id, token]);

  const useFavorite = (fav) => {
    if (!fav?.coords?.length) {
      Alert.alert('Favori', 'Trajet favori incomplet.');
      return;
    }
    const startPt = fav.coords[0];
    const endPt = fav.coords[fav.coords.length - 1];

    dispatch(resetNavigation());
    dispatch(setStart(startPt));
    dispatch(setEnd(endPt));
    dispatch(setLandmarks([]));

    navigation.navigate('Map', {
      favoriteRoute: {
        coords: fav.coords,
        landmarkId: fav.landmarkId || null,
      },
    });
  };

  // ------- Suppression d’un favori -------
  const deleteFavorite = async (routeId) => {
    if (!token || !user?.id) {
      Alert.alert('Session', 'Veuillez vous reconnecter.');
      return;
    }

    const confirm = await new Promise((resolve) => {
      Alert.alert(
        'Supprimer ce favori ?',
        'Cette action est définitive.',
        [
          { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Supprimer', style: 'destructive', onPress: () => resolve(true) },
        ],
        { cancelable: true }
      );
    });
    if (!confirm) return;

    try {
      setDeletingId(routeId);
      const res = await fetch(`${API_BASE}/favroute/${user.id}/${routeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Suppression impossible (HTTP ${res.status})`);
      }

      // Retire localement l’élément supprimé
      setFavs((prev) => prev.filter((f) => f.routeId !== routeId));
      Alert.alert('Favori', 'Trajet supprimé.');
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Impossible de supprimer ce favori.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderFav = ({ item }) => (
    <View style={[styles.favRow, { backgroundColor: currentTheme.cardColor }]}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => useFavorite(item)}>
        <Text style={[styles.favText, { color: currentTheme.textColor }]}>⭐ {item.label}</Text>
        {item.landmarkId != null && (
          <Text style={[styles.favTag, { color: currentTheme.textColor }]}>Landmark: #{item.landmarkId}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteBtn, deletingId === item.routeId && { opacity: 0.6 }]}
        onPress={() => deleteFavorite(item.routeId)}
        disabled={deletingId === item.routeId}
      >
        <Text style={styles.deleteTxt}>{deletingId === item.routeId ? '...' : '🗑️'}</Text>
      </TouchableOpacity>
    </View>
  );

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
            style={[styles.input, { backgroundColor: currentTheme.cardColor, color: currentTheme.textColor, borderColor: currentTheme.cardColor }]}
            value={steps}
            onChangeText={setSteps}
            keyboardType="numeric"
            placeholder="Ex: 2000"
            placeholderTextColor="#999"
          />

          <Text style={[styles.label, { color: currentTheme.textColor }]}>Point de départ (adresse)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.cardColor, color: currentTheme.textColor, borderColor: currentTheme.cardColor }]}
            placeholder="Laissez vide pour utiliser votre position"
            placeholderTextColor="#999"
            value={startAddress}
            onChangeText={setStartAddress}
          />

          <Text style={[styles.label, { color: currentTheme.textColor }]}>Destination (adresse)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.cardColor, color: currentTheme.textColor, borderColor: currentTheme.cardColor }]}
            placeholder="Adresse d'arrivée"
            placeholderTextColor="#999"
            value={destAddress}
            onChangeText={setDestAddress}
          />

          <TouchableOpacity style={[styles.button, { backgroundColor: '#FFD941' }]} onPress={handleSubmit}>
            <Text style={[styles.buttonText, { color: '#2D2D2D' }]}>Trouver les meilleurs landmarks</Text>
          </TouchableOpacity>

          <View style={styles.sep} />

          <Text style={[styles.title, { color: currentTheme.textColor }]}>Mes trajets favoris</Text>
          {loadingFavs ? (
            <ActivityIndicator style={{ marginTop: 10 }} color={currentTheme.textColor} />
          ) : favs.length === 0 ? (
            <Text style={{ color: currentTheme.textColor, marginTop: 8 }}>Aucun favori pour le moment.</Text>
          ) : (
            <FlatList
              data={favs}
              renderItem={renderFav}
              keyExtractor={(_, idx) => String(idx)}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              style={{ marginTop: 8 }}
            />
          )}
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
  sep: { height: 24 },

  // Favoris
  favRow: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favText: { fontWeight: '700' },
  favSub: { marginTop: 4, opacity: 0.8 },
  favTag: { marginTop: 4, fontStyle: 'italic', opacity: 0.8 },

  deleteBtn: {
    marginLeft: 12,
    backgroundColor: '#FFD941',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c62828',
  },
});
