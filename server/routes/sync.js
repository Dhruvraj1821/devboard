import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { syncUserStats } from '../services/syncService.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log(`Manual sync triggered for user: ${req.user.username}`);

        const stats = await syncUserStats(req.user._id);

        res.json({
            message: 'Sync successful',
            lastUpdated: stats.lastUpdated,
            summary: {
                totalCommits: stats.totalCommits,
                totalPRs: stats.totalPRs,
                currentStreak: stats.currentStreak,
                longestStreak: stats.longestStreak,
                repoCount: stats.repoCount,
                totalStars: stats.totalStars
            }
        });

    } catch (error) {
        if (error.message === 'GITHUB_TOKEN_REVOKED') {
            return res.status(401).json({
                error: 'GitHub access was revoked. Please log in again.'
            });
        }
        if (error.message === 'GITHUB_RATE_LIMITED') {
            return res.status(429).json({
                error: 'GitHub rate limit exceeded. Please try again later.'
            });
        }

        console.error('Sync error:', error.message);
        res.status(500).json({ error: 'Sync failed' });
    }
});

export default router;