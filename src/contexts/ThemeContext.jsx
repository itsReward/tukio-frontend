import React, { createContext, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Available themes
    const themes = {
        light: {
            id: 'light',
            name: 'Light',
            colors: {
                background: 'bg-neutral-50',
                text: 'text-neutral-900',
                primary: 'primary',
                secondary: 'secondary',
                accent: 'accent'
            }
        },
        dark: {
            id: 'dark',
            name: 'Dark',
            colors: {
                background: 'bg-neutral-900',
                text: 'text-neutral-50',
                primary: 'primary-dark',
                secondary: 'secondary-dark',
                accent: 'accent-dark'
            }
        },
        system: {
            id: 'system',
            name: 'System'
        }
    };

    // Use localStorage to persist theme preference
    const [storedTheme, setStoredTheme] = useLocalStorage('theme', 'system');
    const [currentTheme, setCurrentTheme] = useState(themes[storedTheme]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Function to set the theme
    const setTheme = (themeId) => {
        setStoredTheme(themeId);
        setCurrentTheme(themes[themeId]);
    };

    // Check for system theme preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => setIsDarkMode(e.matches);

        // Set initial value
        setIsDarkMode(mediaQuery.matches);

        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply theme to document
    useEffect(() => {
        const effectiveTheme =
            storedTheme === 'system' ?
                (isDarkMode ? themes.dark : themes.light) :
                themes[storedTheme];

        // Remove existing theme classes
        document.documentElement.classList.remove(
            'theme-light',
            'theme-dark'
        );

        // Add new theme class
        document.documentElement.classList.add(`theme-${effectiveTheme.id}`);

        // Update dark mode class for tailwind dark mode variant
        if (effectiveTheme.id === 'dark' || (storedTheme === 'system' && isDarkMode)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Set theme color meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content',
                effectiveTheme.id === 'dark' ? '#0f172a' : '#f8fafc'
            );
        }
    }, [storedTheme, isDarkMode]);

    return (
        <ThemeContext.Provider
            value={{
                theme: currentTheme,
                setTheme,
                themes: Object.values(themes),
                isDarkMode: (currentTheme.id === 'dark') || (storedTheme === 'system' && isDarkMode)
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};