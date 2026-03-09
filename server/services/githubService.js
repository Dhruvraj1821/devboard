import axios from 'axios';

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