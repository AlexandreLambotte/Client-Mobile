import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE = process.env.API_BASE;
const AVATAR_DIR = 'avatar';

// Construit la source d'image à partir du champ `user.avatar`.
const getAvatarSource = (user) => {
  const fallback = require('../images/stable-diffusion-xl(21).jpg');
  const avatar = user?.avatar;
  if (!avatar) return fallback;

  if (typeof avatar === 'string' && /^https?:\/\//i.test(avatar)) {
    return { uri: `${avatar}?t=${Date.now()}` };
  }
  if (typeof avatar === 'string' && avatar.startsWith('upload/')) {
    return { uri: `${API_BASE}/${avatar}?t=${Date.now()}` };
  }
  return { uri: `${API_BASE}/image/${AVATAR_DIR}/${avatar}?t=${Date.now()}` };
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Profile({ navigation }) {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const [rankTitle, setRankTitle] = useState('');
  const [avgStepsValue, setAvgStepsValue] = useState(null); // moyenne côté API
  const [todaySteps, setTodaySteps] = useState(null);        // pas du jour

  const { width } = Dimensions.get('window');
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const fetchRank = useCallback(async () => {
    if (!user?.rank_id) { setRankTitle(''); return; }
    try {
      const res = await fetch(`${API_BASE}/rank/${user.rank_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) { setRankTitle(''); return; }
      const data = await res.json();
      setRankTitle(data?.title || '');
    } catch { setRankTitle(''); }
  }, [user?.rank_id, token]);

  const fetchAverageSteps = useCallback(async () => {
    if (!user?.id) { setAvgStepsValue(null); return; }
    try {
      const res = await fetch(`${API_BASE}/stepslog/average/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) { setAvgStepsValue(null); return; }

      let data;
      try { data = await res.json(); }
      catch {
        const txt = await res.text();
        data = Number(txt);
      }

      let value = null;
      if (typeof data === 'number' && !Number.isNaN(data)) value = Math.round(data);
      else if (data && typeof data === 'object') {
        const cand = data.average_distance ?? data.avg ?? data.value;
        if (cand != null) value = Math.round(Number(cand));
      }
      setAvgStepsValue(value);
    } catch { setAvgStepsValue(null); }
  }, [user?.id, token]);

  const fetchTodaySteps = useCallback(async () => {
    if (!user?.id) { setTodaySteps(null); return; }
    try {
      const res = await fetch(`${API_BASE}/stepslog/${user.id}?limit=1&skip=0`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) { setTodaySteps(null); return; }
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) { setTodaySteps(null); return; }
      const last = arr[0];
      if (last?.log_date?.slice(0, 10) === todayISO()) {
        const n = Number(last.distance_walked);
        setTodaySteps(Number.isFinite(n) ? n : null);
      } else {
        setTodaySteps(null);
      }
    } catch { setTodaySteps(null); }
  }, [user?.id, token]);

  // Montée initiale: on garde tes effets existants
  useEffect(() => { fetchRank(); }, [fetchRank]);
  useEffect(() => { fetchAverageSteps(); }, [fetchAverageSteps]);

  // ✅ Rafraîchir au retour sur l’écran (rank + average + today)
  useFocusEffect(
    useCallback(() => {
      fetchRank();
      fetchAverageSteps();   // <-- mise à jour dynamique au focus
      fetchTodaySteps();
    }, [fetchRank, fetchAverageSteps, fetchTodaySteps])
  );

  const stepsLabel = 'Today';
  const goal = 'Goal 10000/Day';
  const avgStepsLabel = 'Last 7 days';

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Partie supérieure avec l'image et les infos de l'utilisateur */}
      <View style={styles.topSection}>
        <Image
          source={require('../images/arriereplan.jpg')}
          style={styles.coverImage}
        />
        <LinearGradient
          colors={[currentTheme.gradientColor, currentTheme.backgroundColor]}
          style={styles.gradient}
        />
        <View style={styles.profileInfo}>
          <Image
            source={getAvatarSource(user)}
            style={[styles.profileImage, { borderColor: '#FFD941' }]}
          />
          <Text style={[styles.userName, { color: currentTheme.textColor }]}>
            {user?.username || 'Utilisateur'}
          </Text>
        </View>
      </View>

      {/* Partie avec les rectangles */}
      <View style={styles.middleSection}>
        <View style={[styles.card, { backgroundColor: currentTheme.cardColor }]}>
          <View style={[styles.cardTop, { backgroundColor: currentTheme.cardColor }]}>
            <MaterialIcons name="directions-walk" size={36} style={{ color: currentTheme.textColor }} />
            <Text style={[styles.cardTitle, { color: currentTheme.textColor }]}>Steps</Text>
            <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]}>{stepsLabel}</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardValue}>
              {todaySteps != null ? todaySteps : '—'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: currentTheme.cardColor }]}>
          <View style={[styles.cardTop, { backgroundColor: currentTheme.cardColor }]}>
            <MaterialIcons name="calendar-today" size={36} style={{ color: currentTheme.textColor }} />
            <Text style={[styles.cardTitle, { color: currentTheme.textColor }]}>Average steps</Text>
            <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]}>{avgStepsLabel}</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardValue}>
              {avgStepsValue != null ? avgStepsValue : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Grand rectangle en bas : affiche le rang */}
      <TouchableOpacity
        style={[styles.bottomSection, { backgroundColor: '#FFD941' }]}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <MaterialIcons name="emoji-events" size={50} color="#232323" />
        <Text style={styles.goldTitle}>{rankTitle || 'Rank'}</Text>
        <Text style={styles.goldSubtitle}>
          Une activité de folie !
        </Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    position: 'relative',
    height: 297,
    width: '100%',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  profileInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  card: {
    width: 144,
    height: 215,
    borderRadius: 25,
    overflow: 'hidden',
  },
  cardTop: {
    padding: 10,
    height: 133,
    alignItems: 'center',
  },
  cardBottom: {
    backgroundColor: '#FFD941',
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  cardValue: {
    color: '#2D2D2D',
    fontWeight: 'bold',
    fontSize: 20,
  },
  bottomSection: {
    marginHorizontal: 35,
    height: 186,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldTitle: {
    color: '#232323',
    fontWeight: 'bold',
    fontSize: 36,
  },
  goldSubtitle: {
    color: '#232323',
    fontSize: 18,
  },
});
