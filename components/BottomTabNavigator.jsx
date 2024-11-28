import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from '../screens/Profile';
import Map from '../screens/Map';
import Settings from '../screens/Settings';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: { backgroundColor: '#232323' },
                tabBarActiveTintColor: '#FFF',
                tabBarInactiveTintColor: '#FFD941',
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Map"
                component={Map}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="settings" size={size} color={color} />
                    ),
                }}
            >
                {(props) => <Settings {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
