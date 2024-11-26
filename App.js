import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import ThemeProvider, { useTheme } from './contexts/ThemeContext'; // Import du contexte
import Profile from './screens/Profile';
import Map from './screens/Map';
import Settings from './screens/Settings';

const Tab = createBottomTabNavigator();

// Composant principal enveloppé par ThemeProvider
export default function App() {
    return (
        <ThemeProvider>
            <NavigationContainer>
                <ThemedApp />
            </NavigationContainer>
        </ThemeProvider>
    );
}

// Composant utilisant le thème pour appliquer les styles globaux
function ThemedApp() {
    const { theme, themes } = useTheme(); // Récupère le thème et ses styles

    return (
        <View style={[styles.container, { backgroundColor: themes[theme].backgroundColor }]}>
            <Tab.Navigator
                initialRouteName="Profile"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                        else if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
                        else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarStyle: { backgroundColor: '#FFD941' },
                    tabBarActiveTintColor: '#2D2D2D',
                    tabBarInactiveTintColor: '#2D2D2D',
                    headerShown: false,
                })}
            >
                <Tab.Screen name="Profile" component={Profile} />
                <Tab.Screen name="Map" component={Map} />
                <Tab.Screen name="Settings" component={Settings} />
            </Tab.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
