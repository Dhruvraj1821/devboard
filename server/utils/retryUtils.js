const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const withRetry = async (fn, retries = 2, baseDelay = 2000) => {
    let lastError;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            
            return await fn();

        } catch (error) {
            lastError = error;

            
            if (
                error.message === 'GITHUB_TOKEN_REVOKED' ||
                error.message === 'GITHUB_RATE_LIMITED'
            ) {
                throw error; 
            }

            
            if (attempt > retries) {
                throw error;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`[RETRY] Attempt ${attempt} failed: ${error.message}`);
            console.log(`[RETRY] Retrying in ${delay / 1000}s...`);

            await sleep(delay);
        }
    }

    throw lastError;
};