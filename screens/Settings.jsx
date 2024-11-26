import React , { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

export default function Settings() {
    const { theme, themes, toggleTheme } = useTheme(); // Récupère le contexte

    return (
        <View style={[styles.container, { backgroundColor: themes[theme].backgroundColor }]}>
            <Header username="Camille22" />
            <Text style={{ color: themes[theme].textColor, fontSize: 20 }}>Settings</Text>
            <Button title="Toggle Theme" onPress={toggleTheme} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 70, // Hauteur du header
    },
});
