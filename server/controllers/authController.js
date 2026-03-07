import axios from 'axios';
import crypto from 'crypto';
import User from '../models/User.js';

const stateStore = new Map();

export const githubLogin = (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    stateStore.set(state, Date.bind() + 600000);
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_url: 'http://localhost:5000/api/auth/github/callback',
        scope: 'read:user user:email',
    });

    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params}`;
    res.redirect(githubAuthUrl);
}

export const githubCallback = async (req, res)=> {
    res.json({message: "callback route working"});
}