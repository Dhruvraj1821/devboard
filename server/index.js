import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/db.js';
import './models/User.js'
import authRouter from './routes/auth.js';
import testRouter from './routes/test.js';

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server  running on port ${PORT}`);
});