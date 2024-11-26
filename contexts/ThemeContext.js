import React, { createContext, useState, useContext } from 'react';

// Créez le contexte
export const ThemeContext = createContext();

// Composant Provider pour fournir le contexte
export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    // Thème clair et sombre
    const themes = {
        light: {
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
        },
        dark: {
            backgroundColor: '#2D2D2D',
            textColor: '#FFFFFF',
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