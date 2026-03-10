import cron from 'node-cron';
import User from '../models/User.js';
import { syncUserStats } from '../services/syncService.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const runNightlySync = async () => {
    console.log(`[CRON] Nightly sync started at ${new Date().toISOString()}`);

    const users = await User.find({tokenRevoked: {$ne: true}});

    console.log(`[CRON] Found ${users.length} users to sync`);

    let successCount = 0;
    let failureCount = 0;

    for (const user of users){
        try{
            await syncUserStats(user._id);
            successCount++;
            console.log(`[CRON] Synced: ${user.username}`);

            await sleep(2000);
        } catch(error){
            failureCount++;

            if(error.message === 'GITHUB_TOKEN_REVOKED'){
                console.log(`[CRON] Token revoked for ${user.username} - marking user`);

                await User.findByIdAndUpdate(user._id, {
                    tokenRevoked: true,
                    $push: {
                        syncErrors: {
                            message: 'GitHub token revoked',
                            timestamp: new Date()
                        }
                    }
                });
                continue;
            }

            if(error.message === 'GITHUB_RATE_LIMITED'){
                console.error('[CRON] Rate limited by GitHub - stopping sync job');
                break;
            }
            console.error(`[CRON] Failed to sync ${user.username}: ${error.message}`);
            await User.findByIdAndUpdate(user._id, {
                $push: {
                    syncErrors: {
                        message: error.message,
                        timestamp: new Date()
                    }
                }
            });
        }
    }
    console.log(`[CRON] Nightly sync complete - ${successCount} succeeded and ${failureCount} failed`);
}

export const initCronJobs = () => {
    cron.schedule('*/2 * * * *', async () => {
        console.log('[CRON] Scheduled trigger fired');
        await runNightlySync();
    });

    console.log('[CRON] Nightly sync job registered — runs at 2:00 AM daily');
};