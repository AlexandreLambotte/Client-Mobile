import { buildSegmentsFromORS, resolveAddress } from '../utils/routeUtils';

export async function saveFavoriteRoute({ token, user, apiBase, ors, polyline }) {
  if (!token || !user?.id) throw new Error('Session invalide');

  const segmentsPayload = buildSegmentsFromORS(ors);
  if (!segmentsPayload.length) throw new Error("Impossible d'extraire les segments.");

  const startPt = polyline[0];
  const endPt = polyline[polyline.length - 1];

  const [startAddress, endAddress] = await Promise.all([
    resolveAddress(startPt.latitude, startPt.longitude),
    resolveAddress(endPt.latitude, endPt.longitude),
  ]);

  const body = { routes: segmentsPayload, start_address: startAddress, end_address: endAddress };

  const res = await fetch(`${apiBase}/favroute/${user.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Erreur API');
  }

  return { ok: true };
}