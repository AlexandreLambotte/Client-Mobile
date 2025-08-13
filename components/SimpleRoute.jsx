import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

export default function SimpleRoute({ origin, destination, onRouteCalculated }) {
  const landmarks = useSelector((state) => state.navigation.landmarks);
  const selectedPOIs = useSelector((state) => state.navigation.selectedPOIs);

  // POIs sélectionnés, stabilisés en référence et nettoyés/parsés
  const waypoints = useMemo(() => {
    if (!Array.isArray(landmarks) || !Array.isArray(selectedPOIs)) return [];
    return landmarks
      .filter((lm) => selectedPOIs.includes(lm.id))
      .map((poi) => ({
        latitude: Number(poi.latitude),
        longitude: Number(poi.longitude),
      }))
      .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
  }, [landmarks, selectedPOIs]);

  
  const round6 = (n) => Math.round(Number(n) * 1e6) / 1e6;

  // Clé stable de la requête ORS
  const requestKey = useMemo(() => {
    if (!origin || !destination) return null;
    const o = { lat: round6(origin.latitude), lon: round6(origin.longitude) };
    const d = { lat: round6(destination.latitude), lon: round6(destination.longitude) };
    const w = waypoints.map((p) => ({ lat: round6(p.latitude), lon: round6(p.longitude) }));
    return JSON.stringify({ o, d, w });
  }, [origin, destination, waypoints]);

  const inflight = useRef(null);          // AbortController en cours
  const lastTriedKey = useRef(null);      // Clé de la dernière tentative
  const lastCompletedKey = useRef(null);  // Clé de la dernière complétion

  useEffect(() => {
    if (!requestKey) return;

    // Évite relance si on a déjà complété cette clé
    if (requestKey === lastCompletedKey.current) return;

    // Évite relance si la même tentative est déjà en cours
    if (requestKey === lastTriedKey.current) return;

    // Annule la requête précédente le cas échéant
    if (inflight.current) {
      inflight.current.abort?.();
      inflight.current = null;
    }

    lastTriedKey.current = requestKey;
    const controller = new AbortController();
    inflight.current = controller;

    const { o, d, w } = JSON.parse(requestKey);
    const coordinates = [
      [o.lon, o.lat],
      ...(w || []).map((p) => [p.lon, p.lat]),
      [d.lon, d.lat],
    ];

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
          {
            method: 'POST',
            signal: controller.signal,
            headers: {
              Authorization:
                'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA0ZmE5YWY5N2M4NjQwNjU5ODFiNWM1OWEzNjczMzY2IiwiaCI6Im11cm11cjY0In0=',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coordinates,
              instructions: true,
              language: 'fr',
              units: 'm',
              elevation: false,
            }),
          }
        );

        // Si annulé entre-temps → on ignore
        if (inflight.current !== controller) return;

        const data = await response.json().catch(() => null);

        if (!data?.features?.length) {
          console.warn('Aucune route trouvée.');
          lastCompletedKey.current = requestKey;
          inflight.current = null;
          return;
        }

        const feat = data.features[0];
        const coords = (feat.geometry?.coordinates || []).map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        }));

        const summary = feat.properties?.summary || {};
        const distance = Number(summary.distance || 0); // mètres
        const duration = Number(summary.duration || 0); // secondes

        onRouteCalculated?.(coords, distance, duration, data);

        lastCompletedKey.current = requestKey;
        inflight.current = null;
      } catch (err) {
        if (err?.name === 'AbortError') return;
        if (inflight.current === controller) {
          console.error('Erreur OpenRouteService:', err?.message || err);
          inflight.current = null;
        }
      }
    };

    fetchRoute();

    return () => {
      if (inflight.current === controller) {
        controller.abort?.();
        inflight.current = null;
      }
    };
  }, [requestKey, onRouteCalculated]);

  return null;
}
