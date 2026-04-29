const API_KEY = '7f1e72e61225defa847ad7d9dbc1d5a9';
const BASE_URL = 'https://v3.football.api-sports.io';

export async function findTeamLogo(teamName: string): Promise<string> {
  if (!teamName || teamName.length < 3) return '';
  
  try {
    const response = await fetch(`${BASE_URL}/teams?search=${encodeURIComponent(teamName)}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
      }
    });

    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      return data.response[0].team.logo;
    }

    return '';
  } catch (error) {
    console.error('Logo API Error:', error);
    return '';
  }
}

export async function findLeagueLogo(leagueName: string): Promise<string> {
  if (!leagueName || leagueName.length < 3) return '';
  
  try {
    const response = await fetch(`${BASE_URL}/leagues?search=${encodeURIComponent(leagueName)}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
      }
    });

    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      return data.response[0].league.logo;
    }

    return '';
  } catch (error) {
    console.error('League Logo API Error:', error);
    return '';
  }
}
