import axios from 'axios';
import crypto from 'crypto';
import User from '../models/User.js';
import stateStore from '../utils/stateStore.js';


export const githubLogin = (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    stateStore.set(state, Date.now() + 600000);
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: 'http://localhost:5000/api/auth/github/callback',
        scope: 'read:user user:email',
        state  // ← was missing, this is why GitHub never sent it back
    });
    console.log('GitHub auth URL:', `https://github.com/login/oauth/authorize?${params}`);

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

export const githubCallback = async (req, res) => {
    console.log('Callback query params : ', req.query);
    try {
        const { code, state } = req.query;

        // State check restored now that state is being sent correctly
        if (!state || !stateStore.has(state)) {
            return res.status(401).json({ error: 'Invalid state parameter' });
        }

        if (Date.now() > stateStore.get(state)) {
            stateStore.delete(state);
            return res.status(401).json({ error: 'State parameter expired' });
        }

        stateStore.delete(state);

        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            },
            {
                headers: { Accept: 'application/json' }
            }
        );

        const { access_token, error } = tokenResponse.data;

        if (error || !access_token) {
            return res.status(401).json({ error: 'Failed to exchange code for token' });
        }

        const profileResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'User-Agent': 'DevBoard'
            }
        });

        const { id, login, avatar_url, email } = profileResponse.data;

        const user = await User.findOneAndUpdate(
            { githubId: String(id) },
            {
                githubId: String(id),
                username: login,
                avatarUrl: avatar_url,
                email: email || null,
                githubAccessToken: access_token
            },
            {
                upsert: true,
                returnDocument: 'after'  
            }
        );

        res.json({
            message: 'OAuth successful',
            user: {
                id: user._id,        
                username: user.username,
                avatarUrl: user.avatarUrl
            }
        });

    } catch (error) {
        console.error('OAuth callback error: ', error.message);
        res.status(500).json({ error: 'Authentication failed' });
    }
};