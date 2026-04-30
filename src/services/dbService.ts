import { ref, get, set, child } from 'firebase/database';
import { rtdb } from '../lib/firebase';

const PLACEHOLDER = 'https://via.placeholder.com/150?text=No+Logo';

/**
 * Normalizes names for database keys
 */
export const normalize = (name: string) => name ? name.toLowerCase().trim() : '';

/**
 * Safe write to Firebase with error handling
 */
export async function saveToFirebase(path: string, data: any) {
  try {
    console.log(`[Firebase] Writing to ${path}...`, data);
    await set(ref(rtdb, path), data);
    return true;
  } catch (error) {
    console.error(`[Firebase] Save failed at ${path}:`, error);
    throw error;
  }
}

/**
 * Safe fetch for Team Logo
 */
export async function getTeamLogoFromDb(name: string): Promise<string> {
  if (!name) return PLACEHOLDER;
  const normalizedName = normalize(name);
  try {
    const snapshot = await get(child(ref(rtdb), `logos/teams/${normalizedName}`));
    if (snapshot.exists()) {
      return snapshot.val().logo || PLACEHOLDER;
    }
  } catch (error) {
    console.error(`[Firebase] Error fetching team logo for ${name}:`, error);
  }
  return PLACEHOLDER;
}

/**
 * Safe fetch for League Logo
 */
export async function getLeagueLogoFromDb(name: string): Promise<string> {
  if (!name) return PLACEHOLDER;
  const normalizedName = normalize(name);
  try {
    const snapshot = await get(child(ref(rtdb), `logos/leagues/${normalizedName}`));
    if (snapshot.exists()) {
      return snapshot.val().logo || PLACEHOLDER;
    }
  } catch (error) {
    console.error(`[Firebase] Error fetching league logo for ${name}:`, error);
  }
  return PLACEHOLDER;
}

/**
 * Ensures the basic structure of the logos node exists
 */
export async function ensureLogosStructure() {
  try {
    const snapshot = await get(ref(rtdb, 'logos'));
    if (!snapshot.exists()) {
      console.log('[Firebase] Logos node missing, initializing structure...');
      await set(ref(rtdb, 'logos'), {
        teams: {},
        leagues: {}
      });
    }
  } catch (error) {
    console.error('[Firebase] Failed to ensure structure:', error);
  }
}
