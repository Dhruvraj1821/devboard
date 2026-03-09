import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { fetchGitHubProfile, fetchRepos, fetchContributions } from '../services/githubService.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/github', authMiddleware, async (req, res) => {
    try {
        const userWithToken = await User.findById(req.user._id)
            .select('+githubAccessToken');

        const accessToken = userWithToken.githubAccessToken;

        const [profile, repos, contributions] = await Promise.all([
            fetchGitHubProfile(accessToken),
            fetchRepos(accessToken),
            fetchContributions(accessToken)
        ]);

        res.json({
            profile,
            repoCount: repos.length,
            contributions: {
                totalCommits: contributions.totalCommits,
                totalPRs: contributions.totalPRs,
                totalIssues: contributions.totalIssues,
                totalContributions: contributions.totalContributions,
                sampleDays: contributions.contributionDays.slice(0, 7)
            }
        });

    } catch (error) {
        console.error('Test route error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;