/**
 * Design Tokens Export System
 * 
 * This file exports all design tokens as TypeScript constants for use
 * in CSS-in-JS, component styling, and dynamic theme switching.
 * 
 * Synced with tailwind.config.js for single source of truth.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Primary - Modern Blue
  primary: {
    50: '#f0f6ff',
    100: '#e0ecff',
    200: '#bdd9ff',
    300: '#85b9ff',
    400: '#4e94ff',
    500: '#2563eb', // Main primary
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#172554',
  },
  
  // Accent - Teal
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Accent color
    600: '#0d9488',
    700: '#0f766e',
    800: '#134e4a',
    900: '#0f2f2f',
  },
  
  // Success
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#0f2f1f',
  },
  
  // Warning
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error/Danger
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral - Professional Gray
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic aliases
  background: '#ffffff',
  surface: '#f9fafb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    disabled: '#d1d5db',
  },
  border: '#e5e7eb',
  divider: '#f3f4f6',
} as const;

// Dark mode color overrides
export const darkColors = {
  background: '#111827',
  surface: '#1f2937',
  text: {
    primary: '#f9fafb',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    disabled: '#6b7280',
  },
  border: '#374151',
  divider: '#4b5563',
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  fontSize: {
    'display-lg': '3.5rem',
    'display-md': '3rem',
    'display-sm': '2.25rem',
    'heading-xl': '2rem',
    'heading-lg': '1.5rem',
    'heading-md': '1.25rem',
    'heading-sm': '1.125rem',
    'body-lg': '1.125rem',
    'body-md': '1rem',
    'body-sm': '0.875rem',
    'caption': '0.75rem',
  },
  
  lineHeight: {
    'tight': 1.1,
    'snug': 1.2,
    'normal': 1.4,
    'relaxed': 1.5,
    'loose': 1.6,
  },
  
  fontWeight: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
    mono: [
      '"Fira Code"',
      '"Consolas"',
      '"Monaco"',
      'monospace',
    ],
  },
} as const;

// Preset text styles (typography combinations)
export const textStyles = {
  'display-lg': {
    fontSize: '3.5rem',
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  'display-md': {
    fontSize: '3rem',
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  'heading-xl': {
    fontSize: '2rem',
    lineHeight: 1.3,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  'heading-lg': {
    fontSize: '1.5rem',
    lineHeight: 1.4,
    fontWeight: 600,
  },
  'body-md': {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  'body-sm': {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  // Standard shadows
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Elevation shadows
  'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.08)',
  'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.1)',
  'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.12)',
  
  // Interactive shadows
  focus: '0 0 0 3px rgba(37, 99, 235, 0.1)',
  'hover': '0 8px 12px rgba(0, 0, 0, 0.15)',
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: '0',
  xs: '0.25rem',
  sm: '0.375rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  slowest: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// PRESET TOKENS (Combinations for common use cases)
// ============================================================================

export const presets = {
  // Button styles
  button: {
    primary: {
      bg: colors.primary[500],
      color: '#ffffff',
      hover: colors.primary[600],
      focus: colors.primary[700],
    },
    secondary: {
      bg: colors.primary[100],
      color: colors.primary[700],
      hover: colors.primary[200],
      focus: colors.primary[300],
    },
    danger: {
      bg: colors.error[500],
      color: '#ffffff',
      hover: colors.error[600],
      focus: colors.error[700],
    },
  },
  
  // Card styles
  card: {
    bg: '#ffffff',
    border: `1px solid ${colors.border}`,
    shadow: shadows.base,
    radius: borderRadius.lg,
    padding: spacing[6],
  },
  
  // Input styles
  input: {
    bg: '#ffffff',
    border: `1px solid ${colors.border}`,
    focus: `2px solid ${colors.primary[500]}`,
    radius: borderRadius.md,
    padding: `${spacing[2]} ${spacing[4]}`,
  },
} as const;

/**
 * Helper function to apply theme tokens dynamically in styled-components or emotion
 * 
 * @example
 * const StyledButton = styled.button`
 *   background-color: ${getToken('colors.primary.500')};
 *   padding: ${getToken('spacing.4')};
 * `;
 */
export function getToken(path: string): string {
  const keys = path.split('.');
  let value: any = { colors, typography, spacing, shadows, borderRadius, transitions } as const;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Token path not found: ${path}`);
      return '';
    }
  }
  
  return String(value);
}

// Type-safe CSS variable names for CSS-in-JS
export const cssVariables = {
  // Colors
  '--color-primary': colors.primary[500],
  '--color-primary-dark': colors.primary[700],
  '--color-accent': colors.accent[500],
  '--color-success': colors.success[500],
  '--color-warning': colors.warning[500],
  '--color-error': colors.error[500],
  
  // Typography
  '--font-family-sans': typography.fontFamily.sans.join(', '),
  '--font-family-mono': typography.fontFamily.mono.join(', '),
  
  // Spacing
  '--spacing-base': spacing[4],
  '--spacing-small': spacing[2],
  '--spacing-large': spacing[8],
  
  // Shadows
  '--shadow-base': shadows.base,
  '--shadow-lg': shadows.lg,
  
  // Transitions
  '--transition-base': transitions.base,
} as const;

export default {
  colors,
  darkColors,
  typography,
  textStyles,
  spacing,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  presets,
  cssVariables,
  getToken,
};
