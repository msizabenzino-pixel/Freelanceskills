export const palette = {
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  red: {
    500: '#ef4444',
  },
  blue: {
    500: '#3b82f6',
  }
};

export const lightTheme = {
  dark: false,
  colors: {
    primary: palette.emerald[500],
    background: palette.slate[50],
    card: '#ffffff',
    text: palette.slate[900],
    textMuted: palette.slate[500],
    border: palette.slate[200],
    notification: palette.red[500],
    error: palette.red[500],
    success: palette.emerald[500],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  }
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: palette.emerald[500],
    background: palette.slate[950],
    card: palette.slate[900],
    text: palette.slate[50],
    textMuted: palette.slate[400],
    border: palette.slate[800],
    notification: palette.red[500],
    error: palette.red[500],
    success: palette.emerald[500],
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
};

export type Theme = typeof lightTheme;
export const theme = darkTheme; // Default to dark as per existing
