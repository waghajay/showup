import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Fonts, Radii, Spacing } from '../../constants/theme';
import { LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    setLoading(false);

    if (authError) {
      setError(authError);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <LogIn size={28} color={Colors.light.surface1} />
            </View>
            <Text style={styles.appTitle}>ShowUp</Text>
            <Text style={styles.appTagline}>Consistency {'>'} Intensity</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>Sign in to continue tracking</Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.light.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.light.surface1} />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Navigate to Signup */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.gutter + 8,
    paddingVertical: Spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl + 8,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm + 4,
  },
  appTitle: {
    ...Fonts.typography.headlineXlMobile,
    color: Colors.light.textPrimary,
  },
  appTagline: {
    ...Fonts.typography.bodyMd,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.light.surface1,
    borderRadius: Radii.lg,
    padding: Spacing.lg + 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  formTitle: {
    ...Fonts.typography.headlineMd,
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  formSubtitle: {
    ...Fonts.typography.bodyMd,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  errorBanner: {
    backgroundColor: Colors.light.errorContainer,
    borderRadius: Radii.default,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Fonts.typography.bodySm,
    color: Colors.light.error,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Fonts.typography.labelCodeSm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs + 2,
  },
  input: {
    backgroundColor: Colors.light.surface2,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm + 4,
    ...Fonts.typography.bodyMd,
    color: Colors.light.textPrimary,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm + 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    ...Fonts.typography.headlineSm,
    color: Colors.light.surface1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  bottomText: {
    ...Fonts.typography.bodyMd,
    color: Colors.light.textSecondary,
  },
  linkText: {
    ...Fonts.typography.headlineSm,
    color: Colors.light.primary,
    fontSize: 14,
  },
});
