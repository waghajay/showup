import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card } from '../common/Card';
import {
  getUserActiveActivities,
  addUserActivity,
  archiveUserActivity,
  DbActivity,
  getTodayLocalDateString,
} from '../../services/activities';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CategoryType } from '../../types/habit';
import { CATEGORIES } from '../../mock/mockData';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { ArrowLeft, Plus, Archive, RefreshCw, AlertCircle, Check } from 'lucide-react-native';

interface ManageActivitiesProps {
  onBack: () => void;
  onActivitiesChanged?: () => void;
}

const CATEGORY_KEYS: CategoryType[] = ['PLACEMENT', 'COLLEGE', 'HEALTH', 'LIFESTYLE'];

export const ManageActivities: React.FC<ManageActivitiesProps> = ({
  onBack,
  onActivitiesChanged,
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const todayStr = getTodayLocalDateString();

  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('PLACEMENT');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadActivities = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getUserActiveActivities(user.id, todayStr);
      setActivities(data);
    } catch (e: any) {
      console.error('[ManageActivities] Failed to load activities:', e);
      setError('Failed to load user routines. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, todayStr]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleAddActivity = async () => {
    if (!user) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Validation Error', 'Please enter a valid activity name.');
      return;
    }

    try {
      setSubmitting(true);
      await addUserActivity(user.id, trimmed, selectedCategory, todayStr);
      setNewName('');
      setIsAdding(false);
      await loadActivities();
      if (onActivitiesChanged) onActivitiesChanged();
    } catch (e: any) {
      console.error('[ManageActivities] Failed to add activity:', e);
      Alert.alert('Error', e.message || 'Failed to add activity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveConfirm = (act: DbActivity) => {
    Alert.alert(
      'Archive Activity',
      `Are you sure you want to archive "${act.name}"?\n\nIt will remain historically active for today, but will cease appearing starting tomorrow. Historical completion logs will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              setLoading(true);
              await archiveUserActivity(user.id, act.id, todayStr);
              await loadActivities();
              if (onActivitiesChanged) onActivitiesChanged();
            } catch (e: any) {
              console.error('[ManageActivities] Failed to archive activity:', e);
              Alert.alert('Error', 'Failed to archive activity.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && activities.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading routines...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Navigation Header */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={20} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Settings</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Manage Routines</Text>
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.errorContainer }]}>
          <AlertCircle size={20} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.error }]} onPress={loadActivities}>
            <RefreshCw size={14} color="#FFFFFF" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Activity Button / Form */}
      {!isAdding ? (
        <TouchableOpacity
          style={[styles.addTriggerBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => setIsAdding(true)}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addTriggerText}>Add Custom Routine</Text>
        </TouchableOpacity>
      ) : (
        <Card style={[styles.addFormCard, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>New Activity</Text>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Routine Name</Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder="e.g. System Design 1hr"
            placeholderTextColor={colors.textMuted}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORY_KEYS.map((catKey) => {
              const isSelected = selectedCategory === catKey;
              const catInfo = CATEGORIES[catKey];
              return (
                <TouchableOpacity
                  key={catKey}
                  style={[
                    styles.catChip,
                    { backgroundColor: colors.surface2, borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setSelectedCategory(catKey)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: colors.textSecondary },
                      isSelected && styles.catChipTextSelected,
                    ]}
                  >
                    {catInfo?.title || catKey}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setIsAdding(false);
                setNewName('');
              }}
              disabled={submitting}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddActivity}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Add Routine</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Grouped Activity Lists */}
      <View style={styles.categoryGroups}>
        {CATEGORY_KEYS.map((catKey) => {
          const groupActs = activities.filter((a) => (a.category || 'PLACEMENT') === catKey);
          if (groupActs.length === 0) return null;

          const catInfo = CATEGORIES[catKey];

          return (
            <View key={catKey} style={styles.groupSection}>
              <View style={styles.groupHeaderRow}>
                <View
                  style={[
                    styles.catBadge,
                    { backgroundColor: catInfo?.badgeBg || 'rgba(37,99,235,0.1)' },
                  ]}
                >
                  <Text style={[styles.catBadgeText, { color: catInfo?.badgeText || '#2563EB' }]}>
                    {catInfo?.title || catKey}
                  </Text>
                </View>
                <Text style={[styles.groupCount, { color: colors.textSecondary }]}>{groupActs.length} active</Text>
              </View>

              <Card style={[styles.groupCard, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
                {groupActs.map((act, idx) => {
                  const isLast = idx === groupActs.length - 1;
                  return (
                    <View key={act.id} style={[styles.actRow, !isLast && [styles.actBorder, { borderBottomColor: colors.border }]]}>
                      <View style={styles.actInfo}>
                        <Text style={[styles.actName, { color: colors.textPrimary }]}>{act.name}</Text>
                        <Text style={[styles.actDate, { color: colors.textSecondary }]}>Active since {act.active_from}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.archiveBtn}
                        onPress={() => handleArchiveConfirm(act)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Archive size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </Card>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl * 2,
  },
  centerContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Fonts.typography.bodyMd,
    marginTop: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  backText: {
    ...Fonts.typography.headlineSm,
    fontSize: 15,
    marginLeft: 4,
  },
  pageTitle: {
    ...Fonts.typography.headlineMd,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Fonts.typography.bodySm,
    flex: 1,
    marginLeft: Spacing.xs,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  retryText: {
    ...Fonts.typography.bodySm,
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  addTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
  },
  addTriggerText: {
    ...Fonts.typography.headlineSm,
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: Spacing.xs,
  },
  addFormCard: {
    marginBottom: Spacing.lg,
  },
  formTitle: {
    ...Fonts.typography.headlineSm,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Fonts.typography.labelCodeSm,
    marginBottom: 6,
  },
  textInput: {
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Fonts.typography.bodyMd,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  catChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  catChipText: {
    ...Fonts.typography.bodySm,
    fontSize: 11,
    fontWeight: '600',
  },
  catChipTextSelected: {
    color: '#FFFFFF',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
  },
  cancelBtnText: {
    ...Fonts.typography.bodyMd,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
  },
  submitBtnText: {
    ...Fonts.typography.headlineSm,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  categoryGroups: {
    gap: Spacing.md,
  },
  groupSection: {
    marginBottom: Spacing.xs,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  catBadge: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  catBadgeText: {
    ...Fonts.typography.labelCodeSm,
    fontSize: 11,
  },
  groupCount: {
    ...Fonts.typography.bodySm,
    fontSize: 11,
  },
  groupCard: {
    padding: 0,
    overflow: 'hidden',
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  actBorder: {
    borderBottomWidth: 1,
  },
  actInfo: {
    flex: 1,
  },
  actName: {
    ...Fonts.typography.headlineSm,
    fontSize: 15,
  },
  actDate: {
    ...Fonts.typography.bodySm,
    fontSize: 11,
    marginTop: 2,
  },
  archiveBtn: {
    padding: Spacing.xs,
  },
});
