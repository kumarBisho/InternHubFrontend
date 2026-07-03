/**
 * Dark Mode Configuration and Hook
 * 
 * Provides complete dark mode support with:
 * - System preference detection
 * - LocalStorage persistence
 * - Smooth transitions
 * - CSS variable injection
 */

import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { darkColors, colors } from './theme.tokens';

// ============================================================================
// CONTEXT AND TYPES
// ============================================================================

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

/**
 * Wrap your app with this provider at the root level
 * 
 * @example
 * <ThemeProvider defaultTheme="system" storageKey="app-theme">
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme-preference',
}: {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect system preference
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Get current effective theme
  const getEffectiveTheme = useCallback((currentTheme: Theme) => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  }, [getSystemTheme]);

  // Apply theme to DOM
  const applyTheme = useCallback((effectiveTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const isDarkMode = effectiveTheme === 'dark';

    // Update class on root element
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Inject CSS variables
    Object.entries(getCSSVariables(isDarkMode)).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        isDarkMode ? darkColors.surface : '#ffffff'
      );
    }

    setIsDark(isDarkMode);
  }, []);

  // Handle theme changes
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);

    const effectiveTheme = getEffectiveTheme(newTheme);
    applyTheme(effectiveTheme as 'light' | 'dark');
  }, [storageKey, getEffectiveTheme, applyTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    // Get stored preference or use default
    const stored = localStorage.getItem(storageKey);
    const initialTheme = (stored as Theme) || defaultTheme;

    setThemeState(initialTheme);
    const effectiveTheme = getEffectiveTheme(initialTheme);
    applyTheme(effectiveTheme as 'light' | 'dark');
    setMounted(true);
  }, [storageKey, defaultTheme, getEffectiveTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const effectiveTheme = getSystemTheme();
      applyTheme(effectiveTheme as 'light' | 'dark');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getSystemTheme, applyTheme]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// USECONTEXT HOOK
// ============================================================================

/**
 * Use this hook to access the theme context
 * 
 * @example
 * const { isDark, toggle } = useTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return {
    theme: context.theme,
    isDark: context.isDark,
    setTheme: context.setTheme,
    toggleTheme: context.toggleTheme,
  };
}

// ============================================================================
// CSS VARIABLE GENERATION
// ============================================================================

/**
 * Generate complete CSS variables based on theme
 */
function getCSSVariables(isDark: boolean) {
  const themeColors = isDark ? darkColors : colors;

  return {
    // Primary colors
    '--color-primary': colors.primary[500],
    '--color-primary-50': colors.primary[50],
    '--color-primary-100': colors.primary[100],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-primary-700': colors.primary[700],
    '--color-primary-900': colors.primary[900],

    // Semantic colors
    '--color-background': themeColors.background,
    '--color-surface': themeColors.surface,
    '--color-text-primary': themeColors.text.primary,
    '--color-text-secondary': themeColors.text.secondary,
    '--color-text-tertiary': themeColors.text.tertiary,
    '--color-text-disabled': themeColors.text.disabled,
    '--color-border': themeColors.border,
    '--color-divider': themeColors.divider,

    // Status colors
    '--color-success': colors.success[500],
    '--color-success-light': colors.success[100],
    '--color-warning': colors.warning[500],
    '--color-warning-light': colors.warning[100],
    '--color-error': colors.error[500],
    '--color-error-light': colors.error[100],
  } as Record<string, string>;
}

// ============================================================================
// TAILWIND CONFIG DARK MODE
// ============================================================================

/**
 * Add this to your tailwind.config.js to enable dark mode:
 * 
 * export default {
 *   darkMode: 'class', // or 'media' for system preference
 *   // ... rest of config
 * }
 * 
 * The class strategy allows us to add/remove the 'dark' class
 * on the root element for full control.
 */

// ============================================================================
// AUTO-INJECT CSS VARIABLES
// ============================================================================

/**
 * Helper function to inject dark mode styles into head
 * Call this in your app initialization
 */
export function injectDarkModeStyles() {
  const styleId = 'dark-mode-styles';

  // Check if already injected
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /**
     * Dark mode styles and transitions
     */
    
    :root {
      color-scheme: light;
      transition: background-color 250ms ease, color 250ms ease;
    }
    
    :root.dark {
      color-scheme: dark;
      transition: background-color 250ms ease, color 250ms ease;
    }
    
    /**
     * Smooth color transitions for theme switching
     */
    body,
    html {
      transition: background-color 250ms ease, color 250ms ease;
    }
    
    /**
     * Dark mode overrides for common elements
     */
    :root.dark {
      background-color: var(--color-background);
      color: var(--color-text-primary);
    }
    
    :root.dark body {
      background-color: var(--color-background);
      color: var(--color-text-primary);
    }
    
    :root.dark input,
    :root.dark textarea,
    :root.dark select {
      background-color: var(--color-surface);
      color: var(--color-text-primary);
      border-color: var(--color-border);
    }
    
    :root.dark input::placeholder {
      color: var(--color-text-tertiary);
    }
    
    /**
     * Prevent FOUC (Flash of Unstyled Content)
     */
    html:not(.dark) {
      color-scheme: light;
    }
    
    html.dark {
      color-scheme: dark;
    }
  `;

  document.head.appendChild(style);
}

// ============================================================================
// EXAMPLE COMPONENTS
// ============================================================================

/**
 * Theme toggle button component
 * 
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${theme} mode`}
      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {isDark ? (
        // Sun icon (show light mode option)
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 00-1.414 1.414l2.12 2.12a1 1 0 001.414-1.414zM2.05 6.464a1 1 0 000-1.414L4.17 2.88a1 1 0 011.414 1.414L3.464 6.464a1 1 0 000 1.414zM17.95 6.464l2.12-2.12a1 1 0 010 1.414l-2.12 2.12a1 1 0 01-1.414-1.414zM17.95 13.536l2.12 2.12a1 1 0 11-1.414 1.414l-2.12-2.12a1 1 0 011.414-1.414zM3.464 13.536L1.344 15.657a1 1 0 111.414 1.414l2.12-2.121a1 1 0 01-1.414-1.414z" />
        </svg>
      ) : (
        // Moon icon (show dark mode option)
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

export default {
  ThemeProvider,
  useTheme,
  injectDarkModeStyles,
  ThemeToggle,
};
