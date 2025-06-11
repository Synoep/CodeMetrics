/**
 * Get submission history for heatmap visualization
 * @param {string} platform - Optional platform filter (leetcode/codeforces)
 * @param {number} year - Optional year, defaults to current year
 * @returns {Promise<Array>} Array of submission data points
 */
export const getSubmissionHistory = async (platform = null, year = new Date().getFullYear()) => {
  try {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (year) params.append('year', year);
    
    const response = await fetch(`${API_BASE_URL}/leaderboard/submissions?${params}`);
    if (!response.ok) throw new Error('Failed to fetch submission history');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching submission history:', error);
    throw error;
  }
}; 