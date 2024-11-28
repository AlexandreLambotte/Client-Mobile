import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from '../screens/Profile';
import Map from '../screens/Map';
import Settings from '../screens/Settings';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ onLogout }) {

    const { theme, themes } = useTheme(); // Accéder au thème actif

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarStyle: { 
                    backgroundColor: themes[theme].backgroundColor,
                    borderTopWidth: 0,
                    elevation: 0, // Supprime l'ombre pour Android
                    shadowOpacity: 0, // Supprime l'ombre pour iOS
                 },
                tabBarActiveTintColor: themes[theme].activeColor, // Couleur des icônes actives
                tabBarInactiveTintColor: '#FFD941', // Couleur des icônes inactives
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Profile') {
                        iconName = 'person';
                    } else if (route.name === 'Map') {
                        iconName = 'map';
                    } else if (route.name === 'Settings') {
                        iconName = 'settings';
                    }

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Profile" component={Profile} />
            <Tab.Screen name="Map" component={Map} />
            <Tab.Screen name="Settings">
                {(props) => <Settings {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
