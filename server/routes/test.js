import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { fetchGitHubProfile, fetchRepos } from '../services/githubService.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/github', authMiddleware, async (req, res) => {
    try {
        const userWithToken = await User.findById(req.user._id)
            .select('+githubAccessToken');

        const accessToken = userWithToken.githubAccessToken;

        const [profile, repos] = await Promise.all([
            fetchGitHubProfile(accessToken),
            fetchRepos(accessToken)
        ]);

        res.json({
            profile,
            repoCount: repos.length,
            sampleRepos: repos.slice(0, 3)
        });

    } catch (error) {
        console.error('Test route error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;