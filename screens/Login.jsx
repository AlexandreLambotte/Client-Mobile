import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = () => {
        if (email === 'camille22@example.com' && password === 'Camille') {
            onLogin();
        } else {
            Alert.alert('Error', 'Invalid email or password');
            setEmail('');
            setPassword('');
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
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#2D2D2D"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginText}>Login</Text>
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
