const cache: Record<string, string> = JSON.parse(localStorage.getItem('sports_logos_cache') || '{}');

function saveCache() {
  localStorage.setItem('sports_logos_cache', JSON.stringify(cache));
}

export async function getTeamLogo(teamName: string): Promise<string | null> {
  const cacheKey = `team_${teamName.toLowerCase()}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    // Try by name first (more accurate for specific teams)
    let response = await fetch(`/api/proxy/sports?endpoint=teams&name=${encodeURIComponent(teamName)}`);
    
    if (response.status === 429) {
      console.warn('Sports API rate limit reached (429).');
      return null;
    }
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    let data = await response.json();

    if (!data.response || data.response.length === 0) {
      // Fallback to search
      response = await fetch(`/api/proxy/sports?endpoint=teams&search=${encodeURIComponent(teamName)}`);
      
      if (response.status === 429) return null;
      if (!response.ok) throw new Error(`API Search Error: ${response.status}`);
      data = await response.json();
    }

    if (data.response && data.response.length > 0) {
      // Try to find exact match or just take the first one
      const match = data.response.find((r: any) => r.team.name.toLowerCase() === teamName.toLowerCase()) || data.response[0];
      const logoUrl = match.team.logo;
      cache[cacheKey] = logoUrl;
      saveCache();
      return logoUrl;
    }

    return null;
  } catch (error) {
    console.error('Error fetching team logo:', error);
    return null;
  }
}
