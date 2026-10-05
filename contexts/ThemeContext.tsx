import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme as useDeviceColorScheme, Alert } from 'react-native';
import { Colors } from '../constants/theme';
import { useAuth } from './AuthContext';
import { getUserSettings, updateUserSettings } from '../services/notifications';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themePreference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  colors: typeof Colors.light;
  setTheme: (theme: ThemePreference) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const deviceColorScheme = useDeviceColorScheme();
  
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [loading, setLoading] = useState(true);

  // Load saved theme preference when user session changes
  useEffect(() => {
    let isMounted = true;
    async function loadThemeSettings() {
      if (!session?.user?.id) {
        setThemePreferenceState('system');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const settings = await getUserSettings(session.user.id);
        if (isMounted && settings && (settings.theme === 'system' || settings.theme === 'light' || settings.theme === 'dark')) {
          setThemePreferenceState(settings.theme);
        }
      } catch (err) {
        console.error('[ThemeContext] Error loading theme setting from Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadThemeSettings();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  // Resolve active color palette
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (themePreference === 'system') {
      return deviceColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, deviceColorScheme]);

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Set theme preference with optimistic update and database sync
  const setTheme = async (newTheme: ThemePreference) => {
    if (newTheme !== 'system' && newTheme !== 'light' && newTheme !== 'dark') {
      console.warn('[ThemeContext] Invalid theme value provided:', newTheme);
      return;
    }

    const previousTheme = themePreference;
    setThemePreferenceState(newTheme);

    if (session?.user?.id) {
      try {
        await updateUserSettings(session.user.id, { theme: newTheme });
      } catch (err) {
        console.error('[ThemeContext] Failed to persist theme preference:', err);
        setThemePreferenceState(previousTheme);
        Alert.alert(
          'Error Saving Preference',
          'Failed to save your theme setting to the server. Reverted to previous theme.'
        );
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        resolvedTheme,
        isDark,
        colors,
        setTheme,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
