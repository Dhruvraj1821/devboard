export const calculateStreak = (contributionDays) => {
    if(!contributionDays || contributionDays.length === 0){
        return { currentStreak: 0, longestStreak: 0};
    }

    let currentStreak = 0;

    for (let i = contributionDays.length-1 ; i >= 0; i--){
        const day = contributionDays[i];

        if(day.contributionCount > 0){
            currentStreak++;
        }

        else{
            if(i === contributionDays.length - 1){
                continue;
            }
            break;
        }
    }

    let longestStreak = 0;
    let currentRun = 0;

    for(const day of contributionDays){
        if(day.contributionCount > 0){
            currentRun++;
            longestStreak = Math.max(longestStreak, currentRun)
        }
        else {
            currentRun = 0;
        }
    }

    return { currentStreak, longestStreak}
}

export const calculateLanguageStats = (repos) => {
    if(!repos || repos.length===0){
        return [];
    }

    const languageMap = {};

    for(const repo of repos){

        if(!repo.language) continue;

        languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
    }

    const languageArray = Object.entries(languageMap).map(([language, count])=>({
        language,
        count
    }));

    languageArray.sort((a, b) => b.count - a.count);

    return languageArray.slice(0, 5);
}

export const calculateTotalStars = (repos) => {
    if(!repos || repos.length === 0) return 0;

    return repos.reduce((total, repo) => total + repo.stars, 0);
}