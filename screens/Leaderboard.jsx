import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = process.env.API_BASE || 'http://192.168.0.44:3001';
const AVATAR_DIR = 'avatar';

const getAvatarSource = (avatar) => {
  const fallback = require('../images/stable-diffusion-xl(21).jpg');
  if (!avatar || typeof avatar !== 'string') return fallback;
  if (/^https?:\/\//i.test(avatar)) return { uri: `${avatar}?t=${Date.now()}` };
  if (avatar.startsWith('upload/')) return { uri: `${API_BASE}/${avatar}?t=${Date.now()}` };
  return { uri: `${API_BASE}/image/${AVATAR_DIR}/${avatar}?t=${Date.now()}` };
};

const formatSteps = (val) => new Intl.NumberFormat('fr-FR').format(Number(val) || 0);

export default function Leaderboard({ navigation }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useSelector((state) => state.auth);
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour accéder au leaderboard.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/stepslog/leaderboard?limit=50&skip=0`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Impossible de récupérer les données. Code: ${response.status}`);
        const data = await response.json();
        setLeaderboardData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur leaderboard:', error?.message);
        Alert.alert('Erreur', error?.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token]);

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, { backgroundColor: currentTheme.cardColor }]}>
      <Text style={[styles.rank, { color: currentTheme.textColor }]}>{index + 1}</Text>
      <Image source={getAvatarSource(item.avatar)} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={[styles.username, { color: currentTheme.textColor }]} numberOfLines={1}>
          {item.username}
        </Text>
        <Text style={[styles.steps, { color: currentTheme.textColor }]}>
          {formatSteps(item.total_distance)} pas
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={currentTheme.textColor} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: currentTheme.textColor }]}>Classement</Text>

      {loading ? (
        <ActivityIndicator size="large" color={currentTheme.textColor} />
      ) : (
        <FlatList
          data={leaderboardData}
          renderItem={renderItem}
          keyExtractor={(item, idx) => `${item.username || 'user'}-${idx}`}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
  );
}

const AVATAR_SIZE = 44;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 10,
    padding: 6,
    borderRadius: 20,
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  rank: { width: 28, textAlign: 'center', fontWeight: '700' },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, marginHorizontal: 10 },
  info: { flex: 1, justifyContent: 'center' },
  username: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  steps: { fontSize: 14, opacity: 0.9 },
});
