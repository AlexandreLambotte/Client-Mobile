import React, { createContext, useState, useContext } from 'react';

// Créez le contexte
export const ThemeContext = createContext();

// Composant Provider pour fournir le contexte
export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');

    // Thème clair et sombre
    const themes = {
        light: {
            backgroundColor: '#FFFFFF',
            textColor: '#232323',
            cardColor: '#E9E9E9', // Couleur spécifique pour les rectangles en thème clair
            activeColor: '#232323',
        },
        dark: {
            backgroundColor: '#232323',
            textColor: '#FFD941',
            cardColor: '#2D2D2D', // Couleur spécifique pour les rectangles en thème sombre
            activeColor: '#FFFFFF',
        },
    };

    // Fonction pour basculer le thème
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, themes, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook personnalisé pour utiliser le contexte facilement
export const useTheme = () => useContext(ThemeContext);
