// Crée ou met à jour le log de pas du jour pour l’utilisateur.
export async function sendFixedSteps({ token, user, apiBase, steps = 2500 }) {
  if (!token || !user?.id) throw new Error('Session invalide');
  const today = new Date().toISOString().slice(0, 10);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const baseBody = { id: user.id, log_date: today, distance_walked: steps };

  let res = await fetch(`${apiBase}/stepslog`, { method: 'POST', headers, body: JSON.stringify(baseBody) });

  if (res.status === 409) {
    let lastTotal = 0;
    try {
      const getRes = await fetch(`${apiBase}/stepslog/${user.id}?limit=1&skip=0`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (getRes.ok) {
        const arr = await getRes.json();
        if (Array.isArray(arr) && arr.length > 0) lastTotal = Number(arr[0].distance_walked) || 0;
      }
    } catch {}

    const newTotal = lastTotal + steps;

    res = await fetch(`${apiBase}/stepslog`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id: user.id, log_date: today, distance_walked: newTotal }),
    });

    if (!res.ok) {
      res = await fetch(`${apiBase}/stepslog/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ log_date: today, distance_walked: newTotal }),
      });
    }
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Erreur API');
  }

  //retourne une info utilisable par l’écran
  return { ok: true, stepsAdded: steps };
}