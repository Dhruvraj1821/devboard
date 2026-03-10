import GitHubStats from '../models/GitHubStats.js';

const getUserStats = async (userId) => {
    const stats = await GitHubStats.findOne({ user: userId });

    if (!stats) {
        return null;
    }

    return stats;
};


export const getOverview = async (req, res) => {
    try {
        const stats = await GitHubStats.findOne({ user: req.user._id })
            .select('totalCommits totalPRs totalIssues currentStreak longestStreak repoCount totalStars lastUpdated');

        if (!stats) {
            return res.status(404).json({
                error: 'Stats not yet synced — please sync first'
            });
        }

        res.json({
            totalCommits: stats.totalCommits,
            totalPRs: stats.totalPRs,
            totalIssues: stats.totalIssues,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            repoCount: stats.repoCount,
            totalStars: stats.totalStars,
            lastUpdated: stats.lastUpdated
        });

    } catch (error) {
        console.error('getOverview error:', error.message);
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
};


export const getLanguages = async (req, res) => {
    try {
        const stats = await GitHubStats.findOne({ user: req.user._id })
            .select('languageStats');

        if (!stats) {
            return res.status(404).json({
                error: 'Stats not yet synced — please sync first'
            });
        }

        const sorted = [...stats.languageStats]
            .sort((a, b) => b.count - a.count);

        res.json(sorted);

    } catch (error) {
        console.error('getLanguages error:', error.message);
        res.status(500).json({ error: 'Failed to fetch language stats' });
    }
};


export const getCalendar = async (req, res) => {
    try {
        const stats = await GitHubStats.findOne({ user: req.user._id })
            .select('contributionCalendar');

        if (!stats) {
            return res.status(404).json({
                error: 'Stats not yet synced — please sync first'
            });
        }

        res.json(stats.contributionCalendar);

    } catch (error) {
        console.error('getCalendar error:', error.message);
        res.status(500).json({ error: 'Failed to fetch calendar' });
    }
};

export const getRepos = async (req, res) => {
    try {
        const stats = await GitHubStats.findOne({ user: req.user._id })
            .select('topRepos');

        if (!stats) {
            return res.status(404).json({
                error: 'Stats not yet synced — please sync first'
            });
        }

        const sorted = [...stats.topRepos]
            .sort((a, b) => b.stars - a.stars);

        res.json(sorted);

    } catch (error) {
        console.error('getRepos error:', error.message);
        res.status(500).json({ error: 'Failed to fetch repos' });
    }
};

export const getTrends = async (req, res) => {
    try {
        
        const period = parseInt(req.query.period) || 30;

        const stats = await GitHubStats.findOne({ user: req.user._id })
            .select('commitHistory');

        if (!stats) {
            return res.status(404).json({
                error: 'Stats not yet synced — please sync first'
            });
        }

  
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - period);
        const cutoffString = cutoffDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'


        const filtered = stats.commitHistory
            .filter(day => day.date >= cutoffString)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(filtered);

    } catch (error) {
        console.error('getTrends error:', error.message);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
};