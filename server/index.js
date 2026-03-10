import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/db.js';
import './models/User.js';
import './models/GitHubStats.js';
import authRouter from './routes/auth.js';
import testRouter from './routes/test.js';
import syncRouter from './routes/sync.js';
import { initCronJobs } from './jobs/syncJob.js';

const app = express();

connectDB();

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(morgan('dev'));

app.use(express.json());

app.get('/health', (req,res) => {
    res.json({status: 'ok'});
});

app.use('/api/auth', authRouter);
app.use('/api/test', testRouter);
app.use('/api/sync', syncRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server  running on port ${PORT}`);

    initCronJobs();
});