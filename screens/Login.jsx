import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { fetchUserById } from '../redux/slices/authSlice'; // ✅ on importe le thunk

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.44:3001/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorMessage = response.status === 404 
          ? 'Invalid email or password.' 
          : 'An error occurred. Please try again later.';
        Alert.alert('Login Failed', errorMessage);
        return;
      }

      const data = await response.json();
      // data doit contenir { token, user } ; on va recharger le user complet
      const token = data.token;
      const loggedUser = data.user;

      // 1) Récupère le profil complet depuis l’API
      const result = await dispatch(fetchUserById({ id: loggedUser.id, token }));

      if (result.meta.requestStatus !== 'fulfilled') {
        // fallback: si l’API GET échoue, on garde au moins le user renvoyé par /login
        dispatch(login({ token, user: loggedUser }));
      } else {
        // 2) Stocke token + user COMPLET en Redux
        dispatch(login({ token, user: result.payload }));
      }

      // Si tu as une navigation automatique, elle se déclenchera comme avant
      // (ton routeur doit lire isAuthenticated/token côté Redux)
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../images/logo.png')} style={styles.logo} />
      <Text style={styles.appName}>WalkThrough</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
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
