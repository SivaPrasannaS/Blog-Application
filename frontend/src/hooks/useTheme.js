import { useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'cms_theme';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((previousTheme) => (previousTheme === 'light' ? 'dark' : 'light'));

  return useMemo(() => ({ theme, toggleTheme }), [theme]);
};

export default useTheme;