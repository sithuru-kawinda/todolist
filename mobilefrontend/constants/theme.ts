import { Platform } from 'react-native';

// App color palette — matches the web frontend exactly
export const Colors = {
  bgDeep: '#0a2440',
  bgMid: '#113F67',
  bgLight: '#1a5a8a',
  bgCard: '#0f3a5e',
  accent: '#dc2626',
  white: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  success: '#22c55e',
  inProgress: '#3b82f6',
  border: 'rgba(255,255,255,0.10)',
  inputBg: 'rgba(255,255,255,0.10)',

  // Kept for backward compatibility with scaffold components
  light: {
    text: '#ffffff',
    background: '#0a2440',
    tint: '#dc2626',
    icon: '#9ca3af',
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#dc2626',
  },
  dark: {
    text: '#ffffff',
    background: '#0a2440',
    tint: '#dc2626',
    icon: '#9ca3af',
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#dc2626',
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});
