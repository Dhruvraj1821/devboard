# DevBoard

A GitHub analytics dashboard that pulls your contribution data, repository stats, and activity history into one place. Built as a learning project to understand OAuth 2.0, MongoDB aggregations, GraphQL, and scheduled jobs without abstracting any of it behind libraries.

Live: https://devboard-client-ldla.onrender.com  
Backend: https://devboard-xwpa.onrender.com

---

## What it does

After signing in with GitHub, DevBoard syncs your data and shows:

- Contribution heatmap for the past year
- Current and longest commit streaks
- Language breakdown across your repositories
- Commit trend chart with 7, 30, and 90 day views
- Top repositories sortable by stars, forks, or last updated
- Overview stats: total commits, PRs, issues, stars, and repo count

Data is synced manually via the Sync button or automatically every night at 2AM via a scheduled job.

---

## Architecture

```
                        +------------------+
                        |   GitHub OAuth   |
                        |   github.com     |
                        +--------+---------+
                                 |
                          code + state
                                 |
          +----------------------v-----------------------+
          |                   Backend                    |
          |              Node.js / Express               |
          |                                              |
          |   +------------+      +------------------+  |
          |   | Auth       |      | Sync Service     |  |
          |   | Controller |      |                  |  |
          |   |            |      | fetchProfile()   |  |
          |   | - OAuth    |      | fetchRepos()     |  |
          |   |   flow     |      | fetchContribs()  |  |
          |   | - JWT sign |      |   (GraphQL)      |  |
          |   +-----+------+      +--------+---------+  |
          |         |                      |             |
          |         |              +-------v---------+   |
          |         |              | Stats Processor |   |
          |         |              |                 |   |
          |         |              | calcStreak()    |   |
          |         |              | calcLanguages() |   |
          |         |              | calcStars()     |   |
          |         |              +-------+---------+   |
          |         |                      |             |
          |   +-----v----------------------v---------+   |
          |   |           MongoDB Atlas              |   |
          |   |                                      |   |
          |   |   Users          GitHubStats         |   |
          |   |   ------         -----------         |   |
          |   |   githubId       totalCommits        |   |
          |   |   username       streaks             |   |
          |   |   accessToken    languageStats       |   |
          |   |   lastSynced     contributionCal     |   |
          |   |                  commitHistory       |   |
          |   +--------------------------------------+   |
          |                                              |
          |   +------------------------------------------+
          |   | node-cron                                |
          |   | Runs syncUserStats() for all users       |
          |   | every night at 2AM                       |
          +---+------------------------------------------+
                                 |
                               JWT
                                 |
          +----------------------v-----------------------+
          |                  Frontend                    |
          |              React + Vite                    |
          |                                              |
          |   ProtectedRoute                             |
          |        |                                     |
          |        v                                     |
          |   Dashboard                                  |
          |   +------------------+-------------------+  |
          |   | StatsOverview    | CommitTrendChart   |  |
          |   | (6 stat cards)   | (Recharts line)    |  |
          |   +------------------+-------------------+  |
          |   | ContribHeatmap   | LanguagePieChart   |  |
          |   | (calendar-hmap)  | (Recharts pie)     |  |
          |   +------------------+-------------------+  |
          |   | TopRepos (search + filter + sort)     |  |
          |   +---------------------------------------+  |
          +----------------------------------------------+
```

---

## Data Flow

```
User clicks "Sign in with GitHub"
        |
        v
Backend generates random state token
Stores in server-side Map with 10min expiry
Redirects user to GitHub OAuth page
        |
        v
User approves on GitHub
GitHub redirects to /api/auth/github/callback?code=xxx&state=xxx
        |
        v
Backend verifies state (CSRF protection)
Exchanges code for GitHub access_token
Fetches user profile from api.github.com/user
Upserts user in MongoDB (atomic, no duplicates)
Signs JWT with userId, 7 day expiry
Redirects to frontend with token in URL hash
        |
        v
Frontend stores token in localStorage
Checks lastSynced -- if null, triggers auto-sync
        |
        v
Sync: Promise.all([profile, repos, contributions])
                   |          |          |
                   |          |          GraphQL API
                   |          REST API   (contributions only
                   |                      available here)
                   v
Calculate streak, language stats, total stars
Upsert GitHubStats with $set (clean replace, no duplication)
        |
        v
Stats API serves pre-computed data to each component
Each component fetches independently -- partial failures
don't break the whole dashboard
```

---

## Tech Stack

**Backend**
- Node.js with Express (ESM modules throughout)
- MongoDB Atlas with Mongoose
- GitHub OAuth 2.0 — implemented manually, no Passport.js
- GitHub GraphQL API via graphql-request (for contribution data)
- GitHub REST API via axios (for profile and repos)
- node-cron for nightly scheduled sync
- JWT for stateless authentication

**Frontend**
- React 18 with Vite
- TailwindCSS v4
- Recharts for line chart and pie chart
- react-calendar-heatmap for the contribution grid
- Axios with request and response interceptors

**Infrastructure**
- Backend deployed on Render (free tier)
- Frontend deployed on Render as a static site

---

## Project Structure

```
devboard/
├── server/
│   ├── config/
│   │   └── db.js                  MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      OAuth flow, JWT signing
│   │   └── statsController.js     Stats API endpoints
│   ├── jobs/
│   │   └── syncJob.js             node-cron nightly sync
│   ├── middleware/
│   │   └── authMiddleware.js      JWT verification
│   ├── models/
│   │   ├── User.js
│   │   └── GitHubStats.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── stats.js
│   │   └── sync.js
│   ├── services/
│   │   ├── githubService.js       GitHub API calls
│   │   └── syncService.js         ETL pipeline
│   ├── utils/
│   │   ├── stateStore.js          OAuth state Map
│   │   ├── statsUtils.js          Pure calculation functions
│   │   ├── statsUtils.test.js     Jest tests (16 tests)
│   │   └── retryUtils.js          Exponential backoff
│   └── index.js
│
└── client/
    └── src/
        ├── api/
        │   └── axiosInstance.js   Axios with interceptors
        ├── components/
        │   ├── ContributionHeatmap.jsx
        │   ├── StatsOverview.jsx
        │   ├── LanguagePieChart.jsx
        │   ├── CommitTrendChart.jsx
        │   ├── TopRepos.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── AuthSuccess.jsx
            └── Dashboard.jsx
```

---

## Running Locally

**Prerequisites:** Node.js 18+, MongoDB Atlas account, GitHub OAuth App

**1. Clone the repo**

```bash
git clone https://github.com/Dhruvraj1821/devboard
cd devboard
```

**2. Set up the backend**

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
CLIENT_URL=http://localhost:3000
```

**3. Set up the frontend**

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000
```

**4. GitHub OAuth App**

Go to github.com/settings/developers, create a new OAuth App with:
- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:5000/api/auth/github/callback`

**5. Run both servers**

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open `http://localhost:3000`

---

## API Reference

All `/api/stats/*` and `/api/sync` routes require `Authorization: Bearer <token>` header.

```
GET  /api/auth/github              Redirect to GitHub OAuth
GET  /api/auth/github/callback     OAuth callback handler
GET  /api/auth/me                  Get current user profile

POST /api/sync                     Trigger manual sync

GET  /api/stats/overview           Total commits, PRs, issues, streaks, stars
GET  /api/stats/calendar           365-day contribution calendar
GET  /api/stats/languages          Language breakdown across repos
GET  /api/stats/repos              Repository list with metadata
GET  /api/stats/trends?period=30   Commit trend (7, 30, or 90 day periods)
```

---

## Design Decisions Worth Noting

**OAuth without Passport.js.** Passport abstracts the OAuth flow into a few lines but hides what's actually happening. Implementing it manually means understanding the state parameter, the code exchange, and why each step exists.

**GraphQL for contributions.** GitHub's REST API does not expose contribution calendar data. This is only available via their GraphQL API. The project uses both REST (profile, repos) and GraphQL (contributions) which is a realistic pattern for working with APIs that have partial coverage across both.

**Pre-computed stats.** Stats are calculated during sync and stored, not computed on every API request. Sync happens at most once per day. API requests happen on every dashboard load. Moving computation to write time keeps reads fast.

**Component-level data fetching.** Each dashboard component fetches its own data independently. If the heatmap API call fails, the rest of the dashboard still loads. This trades a small amount of efficiency (more parallel requests) for resilience.

**Sequential nightly sync.** The cron job processes users one at a time with a 2 second delay between each rather than running them all in parallel. This avoids hitting GitHub's rate limits when the user base grows.

---

## Tests

```bash
cd server
npm test
```

16 tests covering calculateStreak, calculateLanguageStats, calculateTotalStars, and withRetry (including exponential backoff and permanent error handling).

---

## Known Limitations

- Render free tier spins down after 15 minutes of inactivity. First request after spin-down takes 30-60 seconds.
- Contribution data reflects what GitHub's API returns, which matches github.com but may differ slightly from third-party counting methods.
- No token refresh mechanism. JWT expires after 7 days and the user must log in again.