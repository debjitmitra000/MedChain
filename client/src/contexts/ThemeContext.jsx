import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then default to true
    const saved = localStorage.getItem('medchain-theme');
    return saved ? JSON.parse(saved) : true;
  });

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newTheme = !prev;
      localStorage.setItem('medchain-theme', JSON.stringify(newTheme));
      return newTheme;
    });
  };

  // Save to localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem('medchain-theme', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
