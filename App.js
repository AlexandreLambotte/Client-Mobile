import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';

import ThemeProvider from './contexts/ThemeContext';
import Login from './screens/Login';
import CreateAccount from './screens/CreateAccount';
import BottomTabNavigator from './components/BottomTabNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                'ZenDots': require('./assets/fonts/ZenDots-Regular.ttf'),
            });
            setFontsLoaded(true);
        }

        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FFD941" />
            </View>
        );
    }

    return (
        <ThemeProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {!isAuthenticated ? (
                        // Auth Stack
                        <>
                            <Stack.Screen name="Login">
                                {(props) => (
                                    <Login
                                        {...props}
                                        onLogin={() => setIsAuthenticated(true)}
                                    />
                                )}
                            </Stack.Screen>
                            <Stack.Screen name="CreateAccount" component={CreateAccount} />
                        </>
                    ) : (
                        // Main App Stack
                        <Stack.Screen name="MainApp">
                            {(props) => (
                                <BottomTabNavigator
                                    {...props}
                                    onLogout={() => {
                                        setIsAuthenticated(false); // Réinitialiser l'authentification
                                    }}
                                />
                            )}
                        </Stack.Screen>

                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
}
