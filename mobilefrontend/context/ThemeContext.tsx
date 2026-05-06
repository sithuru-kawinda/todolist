import React, { createContext, useCallback, useContext, useState } from 'react';

export const DarkColors = {
  bgDeep:        '#0a2440',
  bgMid:         '#113F67',
  bgCard:        '#0f3a5e',
  accent:        '#dc2626',
  white:         '#ffffff',
  text:          '#ffffff',
  textSecondary: '#9ca3af',
  textMuted:     '#6b7280',
  success:       '#22c55e',
  inProgress:    '#3b82f6',
  border:        'rgba(255,255,255,0.10)',
  inputBg:       '#0f3a5e',
};

export const LightColors = {
  bgDeep:        '#f0f4f8',
  bgMid:         '#dde6f0',
  bgCard:        '#ffffff',
  accent:        '#dc2626',
  white:         '#ffffff',
  text:          '#1a202c',
  textSecondary: '#4a5568',
  textMuted:     '#718096',
  success:       '#16a34a',
  inProgress:    '#2563eb',
  border:        'rgba(0,0,0,0.12)',
  inputBg:       '#edf2f7',
};

export type AppColors = typeof DarkColors;

interface ThemeContextValue {
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? DarkColors : LightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
