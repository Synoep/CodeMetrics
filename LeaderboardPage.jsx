import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import ActivityHeatmap from '../components/ActivityHeatmap.jsx';
import { getSolvedLeaderboard, getContestLeaderboard, syncUsersToLeaderboard, updateAllLeaderboardStats, testScrapers, getSubmissionHistory } from '../services/api';
import { FaTrophy, FaCode, FaStar, FaFilter, FaSync, FaUserPlus, FaChartLine, FaBug, FaCalendarAlt } from 'react-icons/fa';
import { SiLeetcode, SiCodeforces } from 'react-icons/si';
import { useAuth } from '../utils/autcontext.jsx';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState('solved'); // 'solved' or 'contest'
  const [platform, setPlatform] = useState(''); // '', 'leetcode', 'codeforces'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [heatmapData, setHeatmapData] = useState([]);
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  
  // Check if user is an admin (for admin actions)
  const isAdmin = user?.role === 'admin' || user?.username === 'admin';

  useEffect(() => {
    fetchLeaderboard();
    fetchHeatmapData();
  }, [leaderboardType, platform]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (leaderboardType === 'solved') {
        data = await getSolvedLeaderboard(platform || null);
      } else {
        data = await getContestLeaderboard(platform || null);
      }
      
      console.log('Leaderboard data received:', data);
      
      if (data && data.length > 0) {
        // Log the structure of the first entry to understand the data format
        console.log('First entry structure:', JSON.stringify(data[0], null, 2));
      }
      
      setLeaderboardData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data. Please try again later.');
      setLoading(false);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const data = await getSubmissionHistory(platform || null, currentYear);
      setHeatmapData(data);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      // Set empty data on error
      setHeatmapData([]);
    }
  };

  // Sync users with competitive profiles from the User model
  const handleSyncProfiles = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await syncUsersToLeaderboard();
      
      setMessage({
        type: 'success',
        text: `Successfully synced profiles! Added ${result.addedCount} new users, updated ${result.updatedCount} existing users.`
      });
      
      // Refresh leaderboard data after sync
      fetchLeaderboard();
    } catch (error) {
      console.error('Error syncing profiles:', error);
      setMessage({
        type: 'error',
        text: 'Failed to sync profiles. Please try again later.'
      });
    } finally {
      setActionLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  // Update all leaderboard stats
  const handleUpdateStats = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await updateAllLeaderboardStats();
      
      setMessage({
        type: 'success',
        text: `Successfully updated stats for ${result.updatedCount} out of ${result.totalUsers} users.`
      });
      
      // Refresh leaderboard data after update
      fetchLeaderboard();
    } catch (error) {
      console.error('Error updating stats:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update stats. Please try again later.'
      });
    } finally {
      setActionLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  // Test scrapers with sample usernames
  const handleTestScrapers = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      
      // Sample usernames for testing - replace with actual known usernames
      const testData = {
        leetcodeUsername: 'leetcode',
        codeforcesUsername: 'tourist'
      };
      
      const result = await testScrapers(testData);
      
      console.log('Scraper test results:', result);
      
      setMessage({
        type: 'success',
        text: 'Scraper test results logged to console. Check browser console for details.'
      });
    } catch (error) {
      console.error('Error testing scrapers:', error);
      setMessage({
        type: 'error',
        text: 'Failed to test scrapers. Check console for details.'
      });
    } finally {
      setActionLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const getPlatformIcon = (platformName) => {
    switch(platformName) {
      case 'leetcode':
        return <SiLeetcode className="text-yellow-500" />;
      case 'codeforces':
        return <SiCodeforces className="text-blue-500" />;
      default:
        return <FaCode className="text-gray-400" />;
    }
  };

  const getMedalColor = (index) => {
    switch(index) {
      case 0: return 'text-yellow-400 bg-yellow-400/10'; // Gold
      case 1: return 'text-gray-300 bg-gray-400/10'; // Silver
      case 2: return 'text-amber-600 bg-amber-600/10'; // Bronze
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };
  
  // Helper function to get solved problems count for a platform
  const getSolvedProblems = (entry, platform) => {
    if (!entry) return 0;
    
    if (platform) {
      // Try different possible paths to the data
      return entry[`${platform}Solved`] || 
             entry[`${platform}Stats`]?.totalSolved || 
             (platform === 'leetcode' && entry.leetcodeStats?.totalSolved) ||
             (platform === 'codeforces' && entry.codeforcesStats?.totalSolved) ||
             0;
    } else {
      // For "All Platforms" view
      return entry.totalSolved || 
             (entry.leetcodeStats?.totalSolved || 0) + 
             (entry.codeforcesStats?.totalSolved || 0);
    }
  };
  
  // Helper function to get rating for a platform
  const getRating = (entry, platform) => {
    if (!entry) return 0;
    
    if (platform) {
      // Try different possible paths to the data
      return entry[`${platform}Rating`] || 
             entry[`${platform}Stats`]?.contestRating || 
             (platform === 'leetcode' && entry.leetcodeStats?.contestRating) ||
             (platform === 'codeforces' && entry.codeforcesStats?.contestRating) ||
             0;
    } else {
      // For "All Platforms" view
      return entry.maxContestRating || 
             Math.max(
               entry.leetcodeStats?.contestRating || 0,
               entry.codeforcesStats?.contestRating || 0
             );
    }
  };
  
  // Helper function to get username for a platform
  const getUsernameForPlatform = (entry, platform) => {
    if (!entry || !platform) return 'N/A';
    
    return entry[`${platform}Username`] || 
           (platform === 'leetcode' && entry.leetcodeUsername) ||
           (platform === 'codeforces' && entry.codeforcesUsername) ||
           'N/A';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#06141D]">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0c1c29] to-[#1a2c3d] rounded-lg p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">Competitive Programming Leaderboard</h1>
              <p className="text-gray-300 text-lg">
                Track and compare your competitive programming progress with peers across major platforms.
              </p>
            </div>
            
            {/* Admin actions */}
            {isAdmin && (
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <button
                  onClick={handleSyncProfiles}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    <FaUserPlus className="h-4 w-4" />
                  )}
                  <span>Sync Profiles</span>
                </button>
                
                <button
                  onClick={handleUpdateStats}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSync className="h-4 w-4" />
                  <span>Update Stats</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity Heatmap */}
        <ActivityHeatmap data={heatmapData} year={currentYear} />

        {/* Leaderboard Controls */}
        <div className="bg-[#0c1c29] rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLeaderboardType('solved')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  leaderboardType === 'solved'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <FaCode className="h-4 w-4" />
                <span>Problems Solved</span>
              </button>
              
              <button
                onClick={() => setLeaderboardType('contest')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  leaderboardType === 'contest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <FaTrophy className="h-4 w-4" />
                <span>Contest Rating</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPlatform('')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  platform === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <FaFilter className="h-4 w-4" />
                <span>All Platforms</span>
              </button>
              
              <button
                onClick={() => setPlatform('leetcode')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  platform === 'leetcode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <SiLeetcode className="h-4 w-4" />
                <span>LeetCode</span>
              </button>
              
              <button
                onClick={() => setPlatform('codeforces')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  platform === 'codeforces'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <SiCodeforces className="h-4 w-4" />
                <span>Codeforces</span>
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#0c1c29] rounded-lg p-6 shadow-lg overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center p-4">{error}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-4 text-gray-400">Rank</th>
                  <th className="pb-4 text-gray-400">User</th>
                  <th className="pb-4 text-gray-400">Platform</th>
                  <th className="pb-4 text-gray-400">
                    {leaderboardType === 'solved' ? 'Problems Solved' : 'Contest Rating'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, index) => (
                  <tr key={entry._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index < 3 ? getMedalColor(index) : 'text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={entry.avatar || 'https://via.placeholder.com/40'}
                          alt={entry.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="text-white font-medium">{entry.username}</div>
                          <div className="text-sm text-gray-400">{entry.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(entry.platform)}
                        <span className="text-gray-300">
                          {getUsernameForPlatform(entry, entry.platform)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-white font-medium">
                        {leaderboardType === 'solved'
                          ? getSolvedProblems(entry, entry.platform)
                          : getRating(entry, entry.platform)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage; 