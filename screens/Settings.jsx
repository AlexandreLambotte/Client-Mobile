import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

export default function Settings({ onLogout }) {
    const { theme, themes, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: themes[theme].backgroundColor }]}>
            <Header username="Camille22" />
            <Button title="Switch Theme" onPress={toggleTheme} />

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
