import { supabase } from '../lib/supabase';

type ActivityCategory = 'PLACEMENT' | 'COLLEGE' | 'HEALTH' | 'LIFESTYLE';

interface DefaultActivity {
  name: string;
  category: ActivityCategory;
  sort_order: number;
}

const DEFAULT_ACTIVITIES: DefaultActivity[] = [
  // PLACEMENT
  { name: 'DSA', category: 'PLACEMENT', sort_order: 1 },
  { name: 'Aptitude', category: 'PLACEMENT', sort_order: 2 },
  { name: 'Development / Project', category: 'PLACEMENT', sort_order: 3 },
  { name: 'Job / Internship Applications', category: 'PLACEMENT', sort_order: 4 },

  // COLLEGE
  { name: 'College Study', category: 'COLLEGE', sort_order: 5 },
  { name: 'Assignments / Viva / Exam', category: 'COLLEGE', sort_order: 6 },
  { name: 'Revision / Notes', category: 'COLLEGE', sort_order: 7 },

  // HEALTH
  { name: 'Exercise / Walk', category: 'HEALTH', sort_order: 8 },
  { name: 'Sleep 7+ Hours', category: 'HEALTH', sort_order: 9 },
  { name: 'Reading / Personal Growth', category: 'HEALTH', sort_order: 10 },

  // LIFESTYLE
  { name: 'Limit Social Media', category: 'LIFESTYLE', sort_order: 11 },
];

/**
 * Provisions default activities for a new user, idempotently.
 * Only inserts if the user has zero activities.
 * active_from is set to the current date (user's onboarding date).
 */
export async function provisionDefaultActivities(userId: string): Promise<void> {
  // Check if user already has activities (idempotent)
  const { count, error: countError } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    console.error('[Provisioning] Failed to check existing activities:', countError.message);
    return;
  }

  if (count && count > 0) {
    // User already has activities, skip provisioning
    return;
  }

  // Use actual onboarding date (today), not a hardcoded date
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const activitiesToInsert = DEFAULT_ACTIVITIES.map((act) => ({
    user_id: userId,
    name: act.name,
    category: act.category,
    active_from: today,
    sort_order: act.sort_order,
  }));

  const { error: insertError } = await supabase
    .from('activities')
    .insert(activitiesToInsert);

  if (insertError) {
    console.error('[Provisioning] Failed to insert default activities:', insertError.message);
  }
}
