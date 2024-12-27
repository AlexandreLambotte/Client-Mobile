import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons'; // Import des icônes

export default function Settings({ onLogout }) {
    const { theme, themes, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: themes[theme].backgroundColor }]}>
            <Header username="Camille22" />

            {/* Icône pour changer le thème */}
            <TouchableOpacity onPress={toggleTheme} style={styles.iconContainer}>
                {theme === 'light' ? (
                    <Ionicons name="sunny" size={40} color="#FFD941" />
                ) : (
                    <Ionicons name="moon" size={40} color="#FFD941" />
                )}
            </TouchableOpacity>

            {/* Bouton de déconnexion */}
            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 70,
    },
    iconContainer: {
        marginVertical: 20,
        padding: 10,
        borderRadius: 50,
        backgroundColor: '#444', // Fond léger pour l'icône
    },
    logoutButton: {
        marginTop: 20,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#FFD941',
        width: '50%',
        alignItems: 'center',
    },
    logoutText: {
        color: '#2D2D2D',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
