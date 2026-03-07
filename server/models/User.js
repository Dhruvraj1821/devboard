import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    avatarUrl: {
        type: String
    },
    githubAccessToken: {
        type: String
    },
    lastSynced: {
        type: Date,
        default: null
    },
    tokenRevoked: {
        type: Boolean,
        default: false
    },
    syncErrors: [
        {
            message: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;