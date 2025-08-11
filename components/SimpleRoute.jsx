// SimpleRoute.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function SimpleRoute({ origin, destination, onRouteCalculated }) {
  const landmarks = useSelector((state) => state.navigation.landmarks);
  const selectedPOIs = useSelector((state) => state.navigation.selectedPOIs);

  useEffect(() => {
    if (!origin || !destination) return;

    const selectedPOIData = landmarks.filter((lm) => selectedPOIs.includes(lm.id));

    const fetchRoute = async () => {
      const coordinates = [
        [origin.longitude, origin.latitude],
        ...selectedPOIData.map((poi) => [parseFloat(poi.longitude), parseFloat(poi.latitude)]),
        [destination.longitude, destination.latitude],
      ];

      try {
        const response = await fetch(
          'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
          {
            method: 'POST',
            headers: {
              Authorization:
                'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA0ZmE5YWY5N2M4NjQwNjU5ODFiNWM1OWEzNjczMzY2IiwiaCI6Im11cm11cjY0In0=',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coordinates,
              instructions: true,  // ✅ on veut les étapes + instructions
              language: 'fr',      // ✅ en français
              units: 'm',          // ✅ distances en mètres
              elevation: false,
            }),
          }
        );

        const data = await response.json();
        if (!data?.features?.length) {
          console.error('Aucune route trouvée.');
          return;
        }

        const feat = data.features[0];
        const coords = feat.geometry.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        }));

        const summary = feat.properties?.summary || {};
        const distance = summary.distance; // mètres
        const duration = summary.duration; // secondes

        onRouteCalculated?.(coords, distance, duration, data); // ✅ on renvoie aussi la réponse ORS complète
      } catch (err) {
        console.error('Erreur OpenRouteService:', err);
      }
    };

    fetchRoute();
  }, [origin, destination, selectedPOIs, landmarks, onRouteCalculated]);

  return null;
}
