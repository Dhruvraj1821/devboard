import axios from 'axios';
import { GraphQLClient, gql } from 'graphql-request';

const githubAxios = (accessToken) => axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'DevBoard',
        Accept: 'application/vnd.github.v3+json'
    }
});

export const fetchGitHubProfile = async (accessToken) => {
    try{
        const response = await githubAxios(accessToken).get('/user');

        console.log('Rate limit remaining : ', response.headers['x-ratelimit-remaining']);
        
        return {
            githubId: String(response.data.id),
            username: response.data.login,
            avatarUrl: response.data.avatar_url,
            email: response.data.email,
            name: response.data.name,
            bio: response.data.bio,
            location: response.data.location,
            publicRepos: response.data.public_repos,
            followers: response.data.followers,
            following: response.data.following
        }
    } catch (error){
        if(error.response?.status === 401){
            throw new Error('GITHUB_TOKEN_REVOKED');
        }
        if(error.response?.status === 403){
            throw new Error('GITHUB_RATE_LIMITED');
        }
        throw new Error (`Failed to fetch GitHub profile: ${error.message}`);
    }
}

export const fetchRepos = async (accessToken) => {
    try{
        const response = await githubAxios(accessToken).get('/user/repos', {
            params: {
                per_page: 100,
                sort: 'updated',
                affiliation: 'owner'
            }
        });

        return response.data.map( repo => ({
            githubRepoId: String(repo.id),
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            isPrivate: repo.private,
            updatedAt: repo.updated_at
        }));
    } catch(error){
        if(error.response?.status === 401){
            throw new Error('GITHUB_TOKEN_REVOKED');
        }

        if(error.response?.status === 403){
            throw new Error('GITHUB_RATE_LIMITED');
        }

        throw new Error (`Failed to fetch repos : ${error.message}`);
    }
}

export const fetchContributions = async (accessToken) => {
    try{
        const client = new GraphQLClient('https://api.github.com/graphql', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': 'DevBoard'
            }
        });
        const query = gql`
            query {
                viewer {
                    contributionsCollection {
                        totalCommitContributions
                        totalPullRequestContributions
                        totalIssueContributions
                        contributionCalendar {
                            totalContributions
                            weeks {
                                contributionDays {
                                    contributionCount
                                    date
                                    weekday
                                }
                            }
                        }
                    }
                }
            }
        `;

        const data = await client.request(query);

        const collection = data.viewer.contributionsCollection;

        const contributionDays = collection.contributionCalendar.weeks
            .flatMap(week => week.contributionDays)
            .map(day => ({
                date: day.date,
                contributionCount:day.contributionCount,
                weekday: day.weekday
            }));

            return{
                totalCommits: collection.totalCommitContributions,
                totalPRs: collection.totalPullRequestContributions,
                totalIssues: collection.totalIssueContributions,
                totalContributions: collection.contributionCalendar.totalContributions,
                contributionDays
            }
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('GITHUB_TOKEN_REVOKED');
        }
        if (error.response?.status === 403) {
            throw new Error('GITHUB_RATE_LIMITED');
        }
        throw new Error(`Failed to fetch contributions: ${error.message}`);
    }
}