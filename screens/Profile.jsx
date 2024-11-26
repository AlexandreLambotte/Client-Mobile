import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

export default function Profile() {
    const { theme, themes } = useTheme(); // Récupère le thème

    return (
        <View style={[styles.container, { backgroundColor: themes[theme].backgroundColor }]}>
            <Header username="Camille22" />
            <Text style={{ color: themes[theme].textColor, fontSize: 20 }}>Profile</Text>
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
