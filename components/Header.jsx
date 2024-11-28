import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Header({ username }) {
    const navigation = useNavigation(); // Permet d'accéder à la navigation

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Image
                    source={require('../images/stable-diffusion-xl(21).jpg')}
                    style={styles.profileImage}
                />
            </TouchableOpacity>
            <Text style={styles.username}>{username}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', // Fixe le header en haut de l'écran
        top: 0,
        left: 0,
        width: '100%', // S'étend sur toute la largeur
        flexDirection: 'row', // Positionne l'image et le texte côte à côte
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#232323', // Couleur d'arrière-plan (gris)
        zIndex: 10, // Assure que le header reste au-dessus des autres éléments
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25, // Rend l'image circulaire
        marginRight: 10, // Espacement entre l'image et le texte
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF', // Contraste avec le fond jaune
    },
});
