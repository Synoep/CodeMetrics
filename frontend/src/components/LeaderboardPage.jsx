import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrophy, FaCode, FaStar, FaFilter, FaSync, FaUserPlus, FaChartLine, FaBug, FaCalendarAlt } from 'react-icons/fa';
import { SiLeetcode, SiCodeforces } from 'react-icons/si';

const LeaderboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState('solved');
  const [platform, setPlatform] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [heatmapData, setHeatmapData] = useState([]);
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
    fetchHeatmapData();
  }, [leaderboardType, platform]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3002/api/leaderboard/${leaderboardType}${platform ? `?platform=${platform}` : ''}`);
      const data = await response.json();
      
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
      const response = await fetch(`http://localhost:3002/api/leaderboard/heatmap${platform ? `?platform=${platform}` : ''}`);
      const data = await response.json();
      setHeatmapData(data);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setHeatmapData([]);
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
      case 0: return 'text-yellow-400 bg-yellow-400/10';
      case 1: return 'text-gray-300 bg-gray-400/10';
      case 2: return 'text-amber-600 bg-amber-600/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#06141D]">
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
          </div>
        </div>

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
                          {entry.platformUsername || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-white font-medium">
                        {leaderboardType === 'solved'
                          ? entry.totalSolved || 0
                          : entry.contestRating || 0}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage; 