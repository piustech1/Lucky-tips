import { ref, get, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { fetchFromFootballAPI } from './apiService';

/**
 * Checks the logo cache in Firebase RTDB
 */
async function getCachedLogo(type: 'teams' | 'leagues', name: string): Promise<string | null> {
  try {
    const logoRef = ref(rtdb, `logos/${type}/${name}`);
    const snapshot = await get(logoRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Cache Read Error:', error);
    return null;
  }
}

/**
 * Saves a logo to the Firebase RTDB cache
 */
async function saveToCache(type: 'teams' | 'leagues', name: string, url: string) {
  if (!url) return;
  try {
    const logoRef = ref(rtdb, `logos/${type}/${name}`);
    await set(logoRef, url);
  } catch (error) {
    console.error('Cache Save Error:', error);
  }
}

export async function findTeamLogo(teamName: string): Promise<string> {
  if (!teamName || teamName.length < 3) return '';
  
  // 1. Check Cache
  const cached = await getCachedLogo('teams', teamName);
  if (cached) return cached;
  
  // 2. Fetch from API with failover
  try {
    const data = await fetchFromFootballAPI(`teams?name=${encodeURIComponent(teamName)}`);
    console.log(`API Team Response for ${teamName}:`, data);
    
    if (data.response && data.response.length > 0) {
      const logoUrl = data.response[0].team.logo;
      // 3. Save to Cache
      await saveToCache('teams', teamName, logoUrl);
      return logoUrl;
    }

    return '';
  } catch (error) {
    console.error('Logo API Error:', error);
    return '';
  }
}

export async function findLeagueLogo(leagueName: string): Promise<string> {
  if (!leagueName || leagueName.length < 3) return '';
  
  // 1. Check Cache
  const cached = await getCachedLogo('leagues', leagueName);
  if (cached) return cached;
  
  // 2. Fetch from API with failover
  try {
    const data = await fetchFromFootballAPI(`leagues?name=${encodeURIComponent(leagueName)}`);
    console.log(`API League Response for ${leagueName}:`, data);
    
    if (data.response && data.response.length > 0) {
      const logoUrl = data.response[0].league.logo;
      // 3. Save to Cache
      await saveToCache('leagues', leagueName, logoUrl);
      return logoUrl;
    }

    return '';
  } catch (error) {
    console.error('League Logo API Error:', error);
    return '';
  }
}

/**
 * Utility to save a specific logo (used when manually selecting from search results)
 */
export async function saveLogoToCache(type: 'teams' | 'leagues', name: string, url: string) {
  await saveToCache(type, name, url);
}
