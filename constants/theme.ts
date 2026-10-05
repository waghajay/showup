export type ThemeMode = 'system' | 'light' | 'dark';

export const Colors = {
  light: {
    background: '#F8F9FA',
    surface1: '#FFFFFF',
    surface2: '#F1F5F9',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#2563EB',
    primaryContainer: '#EFF6FF',
    success: '#10B981',
    successContainer: '#ECFDF5',
    warning: '#F59E0B',
    warningContainer: '#FFFBEB',
    purple: '#8B5CF6',
    purpleContainer: '#F5F3FF',
    error: '#DC2626',
    errorContainer: '#FEE2E2',
    cardShadow: 'rgba(15, 23, 42, 0.05)',
  },
  dark: {
    background: '#0B0F19',
    surface1: '#151E2E',
    surface2: '#1E293B',
    border: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: '#2563EB',
    primaryContainer: '#1E3A8A',
    success: '#10B981',
    successContainer: '#064E3B',
    warning: '#F59E0B',
    warningContainer: '#78350F',
    purple: '#8B5CF6',
    purpleContainer: '#4C1D95',
    error: '#EF4444',
    errorContainer: '#7F1D1D',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export type ThemeColors = typeof Colors.light;

export function getResolvedTheme(
  preference: ThemeMode,
  systemColorScheme?: 'light' | 'dark' | null
): 'light' | 'dark' {
  if (preference === 'system') {
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

export const Fonts = {
  family: {
    sans: 'PlusJakartaSans_400Regular',
    sansMedium: 'PlusJakartaSans_600SemiBold',
    sansBold: 'PlusJakartaSans_700Bold',
    mono: 'JetBrainsMono_500Medium',
  },
  typography: {
    headlineXl: {
      fontFamily: 'PlusJakartaSans_700Bold',
      fontSize: 36,
      lineHeight: 44,
      letterSpacing: -0.8,
    },
    headlineXlMobile: {
      fontFamily: 'PlusJakartaSans_700Bold',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.6,
    },
    headlineLg: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.5,
    },
    headlineMd: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0.3,
    },
    headlineSm: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: -0.2,
    },
    bodyLg: {
      fontFamily: 'PlusJakartaSans_400Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    bodyMd: {
      fontFamily: 'PlusJakartaSans_400Regular',
      fontSize: 14,
      lineHeight: 20,
    },
    bodySm: {
      fontFamily: 'PlusJakartaSans_400Regular',
      fontSize: 12,
      lineHeight: 16,
    },
    labelCodeMd: {
      fontFamily: 'JetBrainsMono_500Medium',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.1,
    },
    labelCodeSm: {
      fontFamily: 'JetBrainsMono_500Medium',
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.2,
    },
  },
};

export const Radii = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
  checkbox: 6,
  heatmapCell: 4,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  gutter: 16,
};
