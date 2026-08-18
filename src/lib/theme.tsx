import { createContext, useContext, useEffect, useState } from 'react';
import { useTimelineStore } from './store';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const themeAccent = useTimelineStore(state => state.themeAccent);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove previous accent classes
    root.classList.forEach(className => {
      if (className.startsWith('accent-')) {
        root.classList.remove(className);
      }
    });
    // Add new accent class
    root.classList.add(`accent-${themeAccent || 'charcoal'}`);
  }, [themeAccent]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
