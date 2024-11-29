import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function Leaderboard({ navigation }) {
    const { theme, themes } = useTheme();
    const currentTheme = themes[theme];

    // Exemple de données pour le leaderboard
    const leaderboardData = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        username: `User${i + 1}`,
        steps: Math.floor(Math.random() * 20000 + 5000), // Entre 5000 et 25000 pas
    }));

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
            {/* Header avec flèche de retour */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={currentTheme.textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: currentTheme.textColor }]}>Leaderboard</Text>
            </View>

            {/* Liste scrollable */}
            <FlatList
                data={leaderboardData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <View
                        style={[
                            styles.row,
                            {
                                backgroundColor: index % 2 === 0
                                    ? currentTheme.cardColor
                                    : currentTheme.backgroundColor,
                            },
                        ]}
                    >
                        <Text style={[styles.rank, { color: currentTheme.textColor }]}>
                            #{item.id}
                        </Text>
                        <Text style={[styles.username, { color: currentTheme.textColor }]}>
                            {item.username}
                        </Text>
                        <Text style={[styles.steps, { color: currentTheme.textColor }]}>
                            {item.steps} steps
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    rank: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 16,
        flex: 1,
        marginLeft: 16,
    },
    steps: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
