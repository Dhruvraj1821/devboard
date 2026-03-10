import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getOverview,
    getLanguages,
    getCalendar,
    getRepos,
    getTrends
} from '../controllers/statsController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/overview', getOverview);

router.get('/languages', getLanguages);

router.get('/calendar', getCalendar);

router.get('/repos', getRepos);

router.get('/trends', getTrends);

export default router;

