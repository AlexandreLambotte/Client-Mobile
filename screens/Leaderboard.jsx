import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext'; // Utilisation de useUser pour récupérer le token
import { useTheme } from '../contexts/ThemeContext'; // Utilisation du thème via ThemeContext

export default function Leaderboard() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser(); // Récupération des informations utilisateur
    const { theme, themes } = useTheme(); // Récupération du thème actuel et des styles associés

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!user?.token) {
                Alert.alert('Erreur', 'Vous devez être connecté pour accéder au leaderboard.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://192.168.0.44:3001/stepslog/leaderboard', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`, // Envoie du token JWT
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setLeaderboardData(data);
                } else {
                    const errorMessage = `Impossible de récupérer les données. Code: ${response.status}`;
                    console.error(errorMessage);
                    Alert.alert('Erreur', errorMessage);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error.message);
                Alert.alert('Erreur', 'Une erreur est survenue. Vérifiez votre connexion.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user?.token]);

    const renderItem = ({ item, index }) => (
        <View style={[styles.row, { backgroundColor: themes[theme].cardColor }]}>
            <Text style={[styles.text, { color: themes[theme].textColor, flex: 1 }]}>{index + 1}</Text>
            <Text style={[styles.text, { color: themes[theme].textColor, flex: 2 }]}>ID: {item.user_id}</Text>
            <Text style={[styles.text, { color: themes[theme].textColor, flex: 2 }]}>{item.total_distance} pas</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: themes[theme].backgroundColor }]}>
            <Text style={[styles.title, { color: themes[theme].textColor }]}>Classement</Text>
            {loading ? (
                <ActivityIndicator size="large" color={themes[theme].textColor} />
            ) : (
                <FlatList
                    data={leaderboardData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        borderRadius: 5,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});