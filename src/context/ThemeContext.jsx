import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

// Create the Context for our Theme
const ThemeContext = createContext();

// Custom hook to consume the ThemeContext easily in other components
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('emerald_budget_theme');
    return savedTheme ? savedTheme : 'light';
  });

  // Effect to apply the 'dark' class to the document root based on the current theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Persist the user's choice
    localStorage.setItem('emerald_budget_theme', theme);
  }, [theme]);

  // Function to toggle between light and dark
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
