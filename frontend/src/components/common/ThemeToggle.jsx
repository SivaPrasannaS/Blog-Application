import React from 'react';
import { useTheme } from '../../hooks/useTheme';

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLightTheme = theme === 'light';

  return (
    <button
      type="button"
      className="d-inline-flex align-items-center justify-content-center border-0 bg-transparent p-1 text-secondary"
      onClick={toggleTheme}
      aria-label={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{ width: '2.25rem', height: '2.25rem' }}
    >
      {isLightTheme ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

export default ThemeToggle;