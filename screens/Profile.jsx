import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext'; // Importer le contexte du thème

export default function Profile({ navigation }) {
    const userName = "Camille22";
    const steps = 666;
    const goal = "Goal 8000/Day";
    const avgSteps = "Last 7 days";

    const { width } = Dimensions.get('window'); // Récupère la largeur de l'écran

    const { theme, themes } = useTheme(); // Accéder au thème actif

    const currentTheme = themes[theme]; // Récupérer les couleurs actuelles

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
                        source={require('../images/stable-diffusion-xl(21).jpg')} // Remplacer par la vraie photo de profil
                        style={[styles.profileImage, { borderColor: '#FFD941' }]}
                    />
                    <Text style={[styles.userName, { color: currentTheme.textColor }]}>
                        {userName}
                    </Text>
                </View>
            </View>

            {/* Partie avec les rectangles */}
            <View style={styles.middleSection}>
                <View style={[styles.card, { backgroundColor: currentTheme.cardColor }]}>
                    <View style={[styles.cardTop, { backgroundColor: currentTheme.cardColor }]}>
                        <MaterialIcons name="directions-walk" size={36} style={{ color: currentTheme.textColor }}/>
                        <Text style={[styles.cardTitle, { color: currentTheme.textColor }]}>Steps</Text>
                        <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]}>{goal}</Text>
                    </View>
                    <View style={styles.cardBottom}>
                        <Text style={styles.cardValue}>{steps}</Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: currentTheme.cardColor }]}>
                    <View style={[styles.cardTop, { backgroundColor: currentTheme.cardColor }]}>
                        <MaterialIcons name="calendar-today" size={36} style={{ color: currentTheme.textColor }}/>
                        <Text style={[styles.cardTitle, { color: currentTheme.textColor }]}>Average steps</Text>
                        <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]}>{avgSteps}</Text>
                    </View>
                    <View style={styles.cardBottom}>
                        <Text style={styles.cardValue}>{steps}</Text>
                    </View>
                </View>
            </View>

            {/* Grand rectangle en bas */}
            <TouchableOpacity 
                style={[styles.bottomSection, { backgroundColor: '#FFD941' }]}
                onPress={() => navigation.navigate('Leaderboard')} // Naviguer vers l'écran Leaderboard
            >
                <MaterialIcons name="emoji-events" size={50} color="#232323" />
                <Text style={styles.goldTitle}>Gold</Text>
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
        marginHorizontal: 20,
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
