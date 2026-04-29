export async function findTeamLogo(teamName: string): Promise<string> {
  if (!teamName || teamName.length < 3) return '';
  
  try {
    // Try search via proxy
    const response = await fetch(`/api/proxy/sports?endpoint=teams&search=${encodeURIComponent(teamName)}`, {
      method: 'GET'
    });

    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      return data.response[0].team.logo;
    }

    // Try name if search fails
    const nameResponse = await fetch(`/api/proxy/sports?endpoint=teams&name=${encodeURIComponent(teamName)}`, {
      method: 'GET'
    });
    
    const nameData = await nameResponse.json();
    if (nameData.response && nameData.response.length > 0) {
      return nameData.response[0].team.logo;
    }

    return '';
  } catch (error) {
    console.error('Logo API Proxy Error:', error);
    return '';
  }
}

export async function findLeagueLogo(leagueName: string): Promise<string> {
  if (!leagueName || leagueName.length < 3) return '';
  
  try {
    const response = await fetch(`/api/proxy/sports?endpoint=leagues&search=${encodeURIComponent(leagueName)}`, {
      method: 'GET'
    });

    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      return data.response[0].league.logo;
    }

    return '';
  } catch (error) {
    console.error('League Logo API Proxy Error:', error);
    return '';
  }
}
