const KEY1 = '7f1e72e61225defa847ad7d9dbc1d5a9';
const KEY2 = '8bfaf57524156e3fa404491bb0573646';

let currentKey = localStorage.getItem('active_api_key') || KEY1;

export const getActiveKey = () => currentKey;

export const setActiveKey = (keyIndex: 1 | 2) => {
  currentKey = keyIndex === 1 ? KEY1 : KEY2;
  localStorage.setItem('active_api_key', currentKey);
};

export const getActiveKeyIndex = () => currentKey === KEY1 ? 1 : 2;

/**
 * Intelligent fetcher with automatic failover
 */
export async function fetchFromFootballAPI(endpoint: string) {
  const baseUrl = 'https://v3.football.api-sports.io';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

  const makeRequest = async (key: string) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': key,
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if API returned an error in the response body (common for API-Football)
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('API-Football Error detail:', data.errors);
      throw new Error(JSON.stringify(data.errors));
    }

    return data;
  };

  try {
    // Attempt 1: Primary/Current Key
    console.log(`Attempting API call with Key ${getActiveKeyIndex()}...`);
    return await makeRequest(currentKey);
  } catch (error) {
    console.warn('Primary Key failed or quota exceeded. Switching to backup key...');
    
    // Attempt 2: Backup Key (Failover)
    const backupKey = currentKey === KEY1 ? KEY2 : KEY1;
    try {
      const data = await makeRequest(backupKey);
      console.log('Failover successful with backup key.');
      return data;
    } catch (failoverError) {
      console.error('Both API keys failed or quotas exceeded.');
      throw failoverError;
    }
  }
}
