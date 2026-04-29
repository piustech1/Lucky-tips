const API_KEYS = [
  '7f1e72e61225defa847ad7d9dbc1d5a9',
  '8bfaf57524156e3fa404491bb0573646',
  'b5cbf791cc6454b0e11db49beaae420a'
];

let primaryKeyIndex = parseInt(localStorage.getItem('active_api_key_index') || '0');

export const getActiveKey = () => API_KEYS[primaryKeyIndex];

export const setActiveKeyIndex = (index: number) => {
  if (index >= 0 && index < API_KEYS.length) {
    primaryKeyIndex = index;
    localStorage.setItem('active_api_key_index', index.toString());
  }
};

export const getActiveKeyIndex = () => primaryKeyIndex;
export const getAllKeysCount = () => API_KEYS.length;

/**
 * Intelligent fetcher with automatic failover across multiple keys
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
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      // Check for common quota errors
      const errorStr = JSON.stringify(data.errors);
      if (errorStr.toLowerCase().includes('limit') || errorStr.toLowerCase().includes('quota')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      throw new Error(errorStr);
    }

    return data;
  };

  // Try all keys starting from current selected
  let lastError = null;
  for (let i = 0; i < API_KEYS.length; i++) {
    const rotatingIndex = (primaryKeyIndex + i) % API_KEYS.length;
    const currentKey = API_KEYS[rotatingIndex];
    
    try {
      console.log(`Attempting API call with Key ${rotatingIndex + 1}...`);
      return await makeRequest(currentKey);
    } catch (error: any) {
      lastError = error;
      console.warn(`Key ${rotatingIndex + 1} failed: ${error.message}. Trying next...`);
      if (error.message !== 'QUOTA_EXCEEDED' && !error.message.includes('429')) {
         // If it's not a quota issue, maybe it's just a bad request, but we still try next for safety
      }
    }
  }

  throw new Error(`All ${API_KEYS.length} API keys failed: ${lastError?.message || 'Unknown error'}`);
}
