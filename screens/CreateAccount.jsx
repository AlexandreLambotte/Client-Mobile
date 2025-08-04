import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';
import { API_URL } from '@env';

export default function CreateAccount() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateAccount = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert("Erreur", "Tous les champs sont requis !");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erreur", "Les mots de passe ne correspondent pas !");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://192.168.0.44:3001/user/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    is_admin: false,
                    rank_id: 1,
                }),
            });

            if (response.ok) {
                Alert.alert("Succès", "Compte créé avec succès !");
                navigation.navigate('Login');
            } else {
                const errorText = await response.text();
                Alert.alert("Erreur", errorText);
            }
        } catch (error) {
            console.error('Erreur lors de la création du compte:', error);
            Alert.alert("Erreur", "Impossible de se connecter au serveur. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Image source={require('../images/logo.png')} style={styles.logo} />
            </TouchableOpacity>
            <Text style={styles.appName}>WalkThrough</Text>
            <Text style={styles.title}>Créer un compte</Text>

            <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#888"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleCreateAccount} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="#2D2D2D" />
                ) : (
                    <Text style={styles.buttonText}>Créer un compte</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D2D2D',
        paddingHorizontal: 20,
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
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        color: '#FFD941',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        backgroundColor: '#444',
        color: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderRadius: 5,
    },
    button: {
        width: '100%',
        backgroundColor: '#FFD941',
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#2D2D2D',
        fontWeight: 'bold',
        fontSize: 16,
    },
    link: {
        marginTop: 15,
        color: '#FFD941',
        fontSize: 14,
    },
});
