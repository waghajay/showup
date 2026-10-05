import { getResolvedTheme, ThemeMode, Colors } from '../../constants/theme';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

export function runThemeTests() {
  console.log('--- Running Phase 4C Theme & Color Palette Tests ---');

  // 1. getResolvedTheme Tests
  console.log('1. Testing getResolvedTheme...');
  assert(getResolvedTheme('light', 'dark') === 'light', 'Light preference resolves to light');
  assert(getResolvedTheme('dark', 'light') === 'dark', 'Dark preference resolves to dark');
  assert(getResolvedTheme('system', 'dark') === 'dark', 'System preference resolves to system dark');
  assert(getResolvedTheme('system', 'light') === 'light', 'System preference resolves to system light');
  assert(getResolvedTheme('system', null) === 'light', 'System preference fallback to light on null');
  assert(getResolvedTheme('system', undefined) === 'light', 'System preference fallback to light on undefined');

  // 2. Color Palette Token Validation
  console.log('2. Testing Colors palette token parity...');
  const requiredTokens = [
    'background',
    'surface1',
    'surface2',
    'border',
    'textPrimary',
    'textSecondary',
    'textMuted',
    'primary',
    'primaryContainer',
    'success',
    'successContainer',
    'warning',
    'warningContainer',
    'purple',
    'purpleContainer',
    'error',
    'errorContainer',
    'cardShadow',
  ] as const;

  for (const token of requiredTokens) {
    assert(token in Colors.light, `Light palette missing token: ${token}`);
    assert(token in Colors.dark, `Dark palette missing token: ${token}`);
  }

  // 3. Dark Theme Specifics
  console.log('3. Testing Dark Mode Color Specifics...');
  assert(Colors.dark.background === '#0B0F19', 'Dark background is #0B0F19');
  assert(Colors.dark.surface1 === '#151E2E', 'Dark surface1 is #151E2E');
  assert(Colors.dark.surface2 === '#1E293B', 'Dark surface2 is #1E293B');
  assert(Colors.dark.textPrimary === '#F8FAFC', 'Dark textPrimary is #F8FAFC');
  assert(Colors.dark.textSecondary === '#94A3B8', 'Dark textSecondary is #94A3B8');

  console.log('✅ ALL THEME TESTS PASSED SUCCESSFULLY!');
}

runThemeTests();
