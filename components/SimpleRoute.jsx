import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function SimpleRoute({ origin, destination, onRouteCalculated }) {
  const landmarks = useSelector((state) => state.navigation.landmarks);
  const selectedPOIs = useSelector((state) => state.navigation.selectedPOIs);

  useEffect(() => {
    if (!origin || !destination) return;

    const selectedPOIData = landmarks.filter(lm => selectedPOIs.includes(lm.id));

    const fetchRoute = async () => {
      const coordinates = [
        [origin.longitude, origin.latitude],
        ...selectedPOIData.map(poi => [parseFloat(poi.longitude), parseFloat(poi.latitude)]),
        [destination.longitude, destination.latitude],
      ];

      try {
        const response = await fetch(
          'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
          {
            method: 'POST',
            headers: {
              'Authorization': 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA0ZmE5YWY5N2M4NjQwNjU5ODFiNWM1OWEzNjczMzY2IiwiaCI6Im11cm11cjY0In0=',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coordinates }),
          }
        );

        const data = await response.json();
        console.log(data);
        if (!data || !data.features || data.features.length === 0) {
          console.error("Aucune route trouvée.");
          return;
        }

        const coords = data.features[0].geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        const { distance, duration } = data.features[0].properties.summary;

        if (onRouteCalculated) {
          onRouteCalculated(coords, distance, duration);
        }
      } catch (err) {
        console.error("Erreur OpenRouteService:", err);
      }
    };

    fetchRoute();
  }, [origin, destination, selectedPOIs, landmarks]);

  return null;
}
