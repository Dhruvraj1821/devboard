import User from '../models/User.js';
import GitHubStats from '../models/GitHubStats.js';
import { fetchGitHubProfile, fetchRepos, fetchContributions } from './githubService.js';
import { calculateStreak, calculateLanguageStats, calculateTotalStars } from '../utils/statsUtils.js';

export const syncUserStats = async (userId) => {
  
    const user = await User.findById(userId).select('+githubAccessToken');

    if (!user) {
        throw new Error(`User ${userId} not found`);
    }

    if (user.tokenRevoked) {
        throw new Error('GITHUB_TOKEN_REVOKED');
    }

    const accessToken = user.githubAccessToken;

    const [profile, repos, contributions] = await Promise.all([
        fetchGitHubProfile(accessToken),
        fetchRepos(accessToken),
        fetchContributions(accessToken)
    ]);

    const { currentStreak, longestStreak } = calculateStreak(contributions.contributionDays);
    const languageStats = calculateLanguageStats(repos);
    const totalStars = calculateTotalStars(repos);

    const commitHistory = contributions.contributionDays.map(day => ({
        date: day.date,
        count: day.contributionCount
    }));


    const topRepos = [...repos]
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 10);

    const stats = await GitHubStats.findOneAndUpdate(
        { user: userId },  
        {
            user: userId,
            totalCommits: contributions.totalCommits,
            totalPRs: contributions.totalPRs,
            totalIssues: contributions.totalIssues,
            totalContributions: contributions.totalContributions,
            currentStreak,
            longestStreak,
            languageStats,
            contributionCalendar: contributions.contributionDays,
            commitHistory,
            repoCount: repos.length,
            totalStars,
            topRepos,
            lastUpdated: new Date()
        },
        {
            upsert: true,
            returnDocument: 'after'
        }
    );

    
    await User.findByIdAndUpdate(userId, {
        lastSynced: new Date()
    });

    console.log(`Successfully synced stats for user: ${user.username}`);
    return stats;
};