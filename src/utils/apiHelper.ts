export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  fallbackData?: T
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    if (!responseText || responseText.trim().startsWith('<')) {
      console.warn(`[safeFetchJson] Received HTML/Non-JSON from ${url}. Status: ${response.status}`);
      return {
        success: false,
        data: fallbackData,
        error: `Server returned non-JSON response (${response.status})`
      };
    }

    try {
      const parsed = JSON.parse(responseText);
      if (!response.ok) {
        return {
          success: false,
          data: parsed,
          error: parsed?.error || `HTTP ${response.status}`
        };
      }
      return { success: true, data: parsed };
    } catch (parseErr: any) {
      console.warn(`[safeFetchJson] JSON parse error for ${url}:`, parseErr);
      return {
        success: false,
        data: fallbackData,
        error: 'Failed to parse server JSON response'
      };
    }
  } catch (netErr: any) {
    console.warn(`[safeFetchJson] Network/Fetch error for ${url}:`, netErr);
    return {
      success: false,
      data: fallbackData,
      error: netErr?.message || 'Network error'
    };
  }
}
