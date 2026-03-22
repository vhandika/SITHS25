import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'web2-theme';

const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'dark';

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }

    return 'dark';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;
        const body = document.body;

        root.classList.toggle('theme-light', theme === 'light');
        root.classList.toggle('theme-dark', theme === 'dark');
        body.classList.toggle('theme-light', theme === 'light');
        body.classList.toggle('theme-dark', theme === 'dark');

        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const setTheme = (mode: ThemeMode) => {
        setThemeState(mode);
    };

    const toggleTheme = () => {
        setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
