import express from 'express';
import { githubLogin, githubCallback } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/github', githubLogin);

router.get('/github/callback', githubCallback);

router.get('/me', authMiddleware, (req,res) => {
    res.json({
        id: req.user._id,
        username: req.user.username,
        avatarUrl: req.user.avatarUrl,
        email: req.user.email,
        lastSynced: req.user.lastSynced
    });
});

export default router;