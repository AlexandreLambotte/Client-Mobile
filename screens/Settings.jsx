import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateProfile } from '../redux/slices/authSlice';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const dispatch = useDispatch();
  const { theme, toggleTheme, themes } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useSelector((state) => state.auth);

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'L’accès à la galerie est nécessaire.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0]); 
    }
  };

  const handleSave = async () => {
  if (newPassword && !currentPassword) {
    Alert.alert("Erreur", "Le mot de passe actuel est requis pour modifier le mot de passe.");
    return;
  }

  if (newPassword && newPassword.length < 8) {
    Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 8 caractères.");
    return;
  }

  setLoading(true);

  try {
    const res = await dispatch(updateProfile({
      username,
      email,
      password: newPassword,
      currentPassword,
      image,
    }));

    if (res.meta.requestStatus === 'fulfilled') {
      Alert.alert('Succès', 'Profil mis à jour.');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      Alert.alert('Erreur', res.payload || 'Échec de la mise à jour.');
    }
  } catch (err) {
    Alert.alert('Erreur', err.message || 'Erreur inattendue');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <Text style={[styles.title, { color: currentTheme.textColor }]}>Paramètres</Text>

      <TextInput
        style={[styles.input, { color: currentTheme.textColor, borderColor: currentTheme.textColor }]}
        placeholder="Nom d'utilisateur"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={[styles.input, { color: currentTheme.textColor, borderColor: currentTheme.textColor }]}
        placeholder="Adresse e-mail"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, { color: currentTheme.textColor, borderColor: currentTheme.textColor }]}
        placeholder="Mot de passe actuel"
        placeholderTextColor="#aaa"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />

      <TextInput
        style={[styles.input, { color: currentTheme.textColor, borderColor: currentTheme.textColor }]}
        placeholder="Nouveau mot de passe"
        placeholderTextColor="#aaa"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      {image && (
        <Image
          source={{ uri: image.uri }}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
        />
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ccc', marginBottom: 20 }]}
        onPress={handlePickImage}
      >
        <Text style={[styles.buttonText, { color: '#000' }]}>Choisir une photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50', marginBottom: 20 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: currentTheme.cardColor }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>
          Passer en mode {theme === 'light' ? 'sombre' : 'clair'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#FFD941', marginTop: 20 }]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, { color: '#2D2D2D' }]}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
