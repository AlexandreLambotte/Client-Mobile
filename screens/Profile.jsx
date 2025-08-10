import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector } from 'react-redux';

const API_BASE = 'http://192.168.0.44:3001';
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
  // Cas nominal: juste le nom de fichier (ex: "xxxx.jpeg")
  return { uri: `${API_BASE}/image/${AVATAR_DIR}/${avatar}?t=${Date.now()}` };
};

export default function Profile({ navigation }) {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const [rankTitle, setRankTitle] = useState('');
  const [avgStepsValue, setAvgStepsValue] = useState(null); // moyenne côté API

  const steps = 666; // (placeholder) steps “du jour” si tu veux, à brancher sur ton API plus tard
  const goal = 'Goal 8000/Day';
  const avgStepsLabel = 'Last 7 days';

  const { width } = Dimensions.get('window');
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  // Récupère le rang
  useEffect(() => {
    let isMounted = true;
    const fetchRank = async () => {
      try {
        if (!user?.rank_id) {
          if (isMounted) setRankTitle('');
          return;
        }
        const res = await fetch(`${API_BASE}/rank/${user.rank_id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          if (isMounted) setRankTitle('');
          return;
        }
        const data = await res.json(); // attendu: { id, title }
        if (isMounted) setRankTitle(data?.title || '');
      } catch {
        if (isMounted) setRankTitle('');
      }
    };
    fetchRank();
    return () => { isMounted = false; };
  }, [user?.rank_id, token]);

  // Récupère la moyenne de pas
  useEffect(() => {
    let isMounted = true;
    const fetchAverageSteps = async () => {
      try {
        if (!user?.id) {
          if (isMounted) setAvgStepsValue(null);
          return;
        }
        const res = await fetch(`${API_BASE}/stepslog/average/${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          if (isMounted) setAvgStepsValue(null);
          return;
        }
        // L’API peut renvoyer un nombre brut OU un objet { average } / { avg }
        let data;
        try {
          data = await res.json();
        } catch {
          // si ce n'est pas du JSON, on essaie en texte puis Number()
          const txt = await res.text();
          data = Number(txt);
        }

        let value = null;
        if (typeof data === 'number' && !Number.isNaN(data)) value = Math.round(data);
        else if (data && typeof data === 'object') {
          const cand = data.average_distance ?? data.avg ?? data.value;
          if (cand != null) value = Math.round(Number(cand));
        }

        if (isMounted) setAvgStepsValue(value);
      } catch {
        if (isMounted) setAvgStepsValue(null);
      }
    };
    fetchAverageSteps();
    return () => { isMounted = false; };
  }, [user?.id, token]);

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
            <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]}>{goal}</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardValue}>{steps}</Text>
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