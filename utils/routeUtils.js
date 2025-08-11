// utils/routeUtils.js
import { reverseGeocode } from '../utils/geolocation';

/** Transforme la réponse ORS en segments d’instructions compatibles API favorite route. */
export function buildSegmentsFromORS(ors) {
  if (!ors?.features?.length) return [];
  const feat = ors.features[0];
  const coords = feat.geometry?.coordinates || [];
  const segments = feat.properties?.segments || [];

  const stepsFlat = [];
  segments.forEach((seg) => (seg.steps || []).forEach((st) => stepsFlat.push(st)));

  return stepsFlat.map((st) => {
    const [startIdx, endIdx] = st.way_points || [0, 0];
    const startPt = coords[startIdx] || coords[0] || [0, 0];
    const endPt = coords[endIdx] || coords[coords.length - 1] || [0, 0];
    return {
      total_distance: Math.round(Number(st.distance || 0)),
      duration: Math.round(Number(st.duration || 0) / 60),
      instruction: String(st.instruction || ''),
      next_segment: 0,
      start_point_lat: Number(startPt[1]),
      start_point_long: Number(startPt[0]),
      end_point_lat: Number(endPt[1]),
      end_point_long: Number(endPt[0]),
    };
  });
}

/** Convertit lat/lon en adresse normalisée pour l’API favorite route. */
export async function resolveAddress(lat, lon) {
  try {
    const addr = await reverseGeocode(lat, lon);
    const a = addr?.address || addr || {};
    return {
      street: a.road || a.pedestrian || a.footway || a.path || '',
      city: a.city || a.town || a.village || a.municipality || '',
      number: a.house_number ? Number(a.house_number) : 0,
      postal_code: a.postcode ? Number(String(a.postcode).replace(/\D/g, '')) : 0,
      country: a.country || '',
    };
  } catch {
    return { street: '', city: '', number: 0, postal_code: 0, country: '' };
  }
}
