import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';  // Importer le UserContext

export default function Login({ onLogin }) {
    const { setUser } = useUser();  // Utiliser setUser du contexte
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in both email and password.');
            return;
        }

        setLoading(true); // Montre un indicateur de chargement
        try {
            const response = await fetch('http://192.168.0.44:3001/user/login', { // Remplacez par l'IP locale de votre API
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const { token, user } = await response.json(); // Token et infos utilisateur

                // Mettre à jour les données de l'utilisateur dans le contexte
                setUser({ token, user });

                // Appeler le callback onLogin avec les infos utilisateur et token
                onLogin({ token, user });

            } else {
                const errorMessage = response.status === 404 
                    ? 'Invalid email or password.' 
                    : 'An error occurred. Please try again later.';
                Alert.alert('Login Failed', errorMessage);
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Error', 'Unable to connect to the server. Please try again.');
        } finally {
            setLoading(false); // Arrête l'indicateur de chargement
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../images/logo.png')} style={styles.logo} />
            <Text style={styles.appName}>WalkThrough</Text>
            <TextInput
                style={styles.input}
                placeholder="eMail"
                placeholderTextColor="#2D2D2D"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#2D2D2D"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="#2D2D2D" />
                ) : (
                    <Text style={styles.loginText}>Login</Text>
                )}
            </TouchableOpacity>
            <Text style={styles.link} onPress={() => navigation.navigate('CreateAccount')}>
                Create account
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2D2D2D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    appName: {
        fontFamily: 'ZenDots',
        fontSize: 32,
        color: '#FFD941',
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#FFD941',
        width: '80%',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    loginButton: {
        backgroundColor: '#FFD941',
        width: '80%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 20,
    },
    loginText: {
        fontSize: 16,
        color: '#2D2D2D',
        fontWeight: 'bold',
    },
    link: {
        color: '#FFD941',
        fontSize: 14,
        marginTop: 10,
    },
});
