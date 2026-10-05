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
import { UserPlus } from 'lucide-react-native';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: authError, needsConfirmation } = await signUp(email.trim(), password);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    if (needsConfirmation) {
      setSuccessMessage('Account created! Please verify your email before signing in.');
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
              <UserPlus size={28} color={Colors.light.surface1} />
            </View>
            <Text style={styles.appTitle}>ShowUp</Text>
            <Text style={styles.appTagline}>Start building consistency today</Text>
          </View>

          {/* Signup Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create account</Text>
            <Text style={styles.formSubtitle}>Track your daily habits and growth</Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {successMessage && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>{successMessage}</Text>
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
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.light.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={Colors.light.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.light.surface1} />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Navigate to Login */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Sign In</Text>
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
  successBanner: {
    backgroundColor: Colors.light.successContainer,
    borderRadius: Radii.default,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  successText: {
    ...Fonts.typography.bodySm,
    color: Colors.light.success,
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
