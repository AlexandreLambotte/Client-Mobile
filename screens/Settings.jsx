import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice'; // ✅ Corrigé ici
import { useTheme } from '../contexts/ThemeContext'; // ✅ Pour le changement de thème

export default function Settings() {
  const dispatch = useDispatch();
  const { theme, toggleTheme, themes } = useTheme(); // ✅ Accès au thème et switch
  const currentTheme = themes[theme];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <Text style={[styles.title, { color: currentTheme.textColor }]}>Paramètres</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.cardColor }]} onPress={toggleTheme}>
        <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>
          Passer en mode {theme === 'light' ? 'sombre' : 'clair'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#FFD941', marginTop: 20 }]} onPress={handleLogout}>
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
