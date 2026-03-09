import mongoose from 'mongoose';

const gitHubStatsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  
    },

    totalCommits: { type: Number, default: 0 },
    totalPRs: { type: Number, default: 0 },
    totalIssues: { type: Number, default: 0 },
    totalContributions: { type: Number, default: 0 },

    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },

  
    languageStats: [{
        language: String,
        count: Number
    }],

  
    contributionCalendar: [{
        date: String,
        contributionCount: Number,
        weekday: Number
    }],

   
    commitHistory: [{
        date: String,
        count: Number
    }],

    // Repo stats
    repoCount: { type: Number, default: 0 },
    totalStars: { type: Number, default: 0 },

    
    topRepos: [{
        githubRepoId: String,
        name: String,
        fullName: String,
        description: String,
        url: String,
        language: String,
        stars: Number,
        forks: Number,
        updatedAt: String
    }],

  
    lastUpdated: {
        type: Date,
        default: null
    }
});

const GitHubStats = mongoose.model('GitHubStats', gitHubStatsSchema);

export default GitHubStats;