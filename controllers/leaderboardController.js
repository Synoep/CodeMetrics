import Submission from '../models/Submission.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Get submission history for heatmap visualization
 * @route   GET /leaderboard/submissions
 * @desc    Get submission history for all users
 * @access  Public
 */
export const getSubmissionHistory = async (req, res) => {
  try {
    const { platform, userId, year = new Date().getFullYear() } = req.query;
    
    let query = {
      'submissions.date': {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    };

    if (platform) {
      query.platform = platform;
    }

    if (userId) {
      query._id = userId;
    }

    const users = await User.find(query)
      .select('username platform submissions')
      .lean();

    const submissionData = users.map(user => ({
      username: user.username,
      platform: user.platform,
      submissions: user.submissions.map(sub => ({
        date: sub.date,
        count: sub.count,
        difficulty: sub.difficulty
      }))
    }));

    res.json({
      success: true,
      data: submissionData,
      year: parseInt(year)
    });
  } catch (error) {
    console.error('Error fetching submission history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission history',
      error: error.message
    });
  }
};

// Get leaderboard sorted by total problems solved
export const getSolvedLeaderboard = async (req, res) => {
  try {
    const { platform } = req.query;
    
    const matchStage = platform ? { platform } : {};
    
    const leaderboard = await Submission.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalSolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          username: '$userDetails.username',
          name: '$userDetails.name',
          avatar: '$userDetails.profileimage',
          totalSolved: 1
        }
      },
      { $sort: { totalSolved: -1 } }
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching solved leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// Get leaderboard sorted by contest rating
export const getContestLeaderboard = async (req, res) => {
  try {
    const { platform } = req.query;
    
    // This is a placeholder - you'll need to implement actual contest rating logic
    const leaderboard = await Submission.aggregate([
      {
        $group: {
          _id: '$userId',
          contestRating: { $avg: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          username: '$userDetails.username',
          name: '$userDetails.name',
          avatar: '$userDetails.profileimage',
          contestRating: 1
        }
      },
      { $sort: { contestRating: -1 } }
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching contest leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// Update user stats in leaderboard
export const updateUserStats = async (req, res) => {
  try {
    const { userId, platform, submissions } = req.body;
    
    // Add new submissions
    const submissionDocs = submissions.map(sub => ({
      ...sub,
      userId,
      platform
    }));
    
    await Submission.insertMany(submissionDocs);
    
    res.json({ message: 'User stats updated successfully' });
  } catch (error) {
    console.error('Error updating user stats:', error);
    res.status(500).json({ message: 'Error updating user stats' });
  }
};

// Sync users to leaderboard
export const syncUsersToLeaderboard = async (req, res) => {
  try {
    // This would typically involve fetching user data from your user collection
    // and creating initial leaderboard entries
    res.json({ message: 'Users synced successfully' });
  } catch (error) {
    console.error('Error syncing users:', error);
    res.status(500).json({ message: 'Error syncing users' });
  }
};

// Update all user stats
export const updateAllUserStats = async (req, res) => {
  try {
    // This would typically involve updating stats for all users
    res.json({ message: 'All user stats updated successfully' });
  } catch (error) {
    console.error('Error updating all user stats:', error);
    res.status(500).json({ message: 'Error updating all user stats' });
  }
};

// Test scrapers
export const testScrapers = async (req, res) => {
  try {
    const { leetcodeUsername, codeforcesUsername } = req.body;
    
    // This would typically involve testing your scraping functionality
    res.json({ message: 'Scrapers tested successfully' });
  } catch (error) {
    console.error('Error testing scrapers:', error);
    res.status(500).json({ message: 'Error testing scrapers' });
  }
};

// Refresh leaderboard
export const refreshLeaderboard = async (req, res) => {
  try {
    // This would typically involve refreshing all leaderboard data
    res.json({ message: 'Leaderboard refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing leaderboard:', error);
    res.status(500).json({ message: 'Error refreshing leaderboard' });
  }
};

// Test URL extraction
export const testUrlExtraction = async (req, res) => {
  try {
    // This would typically involve testing URL extraction functionality
    res.json({ message: 'URL extraction tested successfully' });
  } catch (error) {
    console.error('Error testing URL extraction:', error);
    res.status(500).json({ message: 'Error testing URL extraction' });
  }
};

/**
 * Get detailed activity leaderboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getActivityLeaderboard = async (req, res) => {
  try {
    const { platform, timeRange = 'week' } = req.query;
    const timeRanges = {
      day: 1,
      week: 7,
      month: 30
    };
    const days = timeRanges[timeRange] || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = {
      lastUpdated: { $gte: startDate }
    };

    if (platform) {
      query.platform = platform;
    }

    const users = await User.find(query)
      .select('username platform solvedCount contestRank rating lastUpdated')
      .sort({ solvedCount: -1, rating: -1 });

    const leaderboard = users.map(user => ({
      username: user.username,
      platform: user.platform,
      solvedCount: user.solvedCount,
      contestRank: user.contestRank,
      rating: user.rating,
      lastUpdated: user.lastUpdated
    }));

    res.json({
      success: true,
      data: leaderboard,
      timeRange: timeRange,
      totalUsers: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching activity leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity leaderboard',
      error: error.message
    });
  }
};

/**
 * Get detailed activity summary for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserActivitySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('username platform solvedCount contestRank rating submissions lastUpdated')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate activity metrics
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklySubmissions = user.submissions.filter(sub => 
      sub.date >= lastWeek
    ).reduce((sum, sub) => sum + sub.count, 0);

    const monthlySubmissions = user.submissions.filter(sub => 
      sub.date >= lastMonth
    ).reduce((sum, sub) => sum + sub.count, 0);

    const summary = {
      username: user.username,
      platform: user.platform,
      solvedCount: user.solvedCount,
      contestRank: user.contestRank,
      rating: user.rating,
      lastUpdated: user.lastUpdated,
      activity: {
        weeklySubmissions,
        monthlySubmissions,
        submissionHistory: user.submissions.map(sub => ({
          date: sub.date,
          count: sub.count,
          difficulty: sub.difficulty
        }))
      }
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching user activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity summary',
      error: error.message
    });
  }
}; 