import { calculateStreak, calculateLanguageStats, calculateTotalStars } from './statsUtils.js';
import { withRetry } from './retryUtils.js';
import { jest } from '@jest/globals';
// --- calculateStreak tests ---

describe('calculateStreak', () => {

    test('returns 0 for empty array', () => {
        expect(calculateStreak([]).currentStreak).toBe(0);
        expect(calculateStreak([]).longestStreak).toBe(0);
    });

    test('calculates current streak correctly', () => {
        const days = [
            { date: '2024-01-01', contributionCount: 0 },
            { date: '2024-01-02', contributionCount: 2 },
            { date: '2024-01-03', contributionCount: 1 },
            { date: '2024-01-04', contributionCount: 3 },
        ];
        expect(calculateStreak(days).currentStreak).toBe(3);
    });

    test('streak broken by zero day', () => {
        const days = [
            { date: '2024-01-01', contributionCount: 2 },
            { date: '2024-01-02', contributionCount: 3 },
            { date: '2024-01-03', contributionCount: 0 }, // streak broken here
            { date: '2024-01-04', contributionCount: 1 },
            { date: '2024-01-05', contributionCount: 2 },
        ];
        // Current streak should be 2 (last two days)
        expect(calculateStreak(days).currentStreak).toBe(2);
    });

    test('calculates longest streak correctly', () => {
        const days = [
            { date: '2024-01-01', contributionCount: 1 },
            { date: '2024-01-02', contributionCount: 1 },
            { date: '2024-01-03', contributionCount: 1 }, // run of 3
            { date: '2024-01-04', contributionCount: 0 }, // broken
            { date: '2024-01-05', contributionCount: 1 },
            { date: '2024-01-06', contributionCount: 1 }, // run of 2
        ];
        expect(calculateStreak(days).longestStreak).toBe(3);
    });

    test('handles all zeros', () => {
        const days = [
            { date: '2024-01-01', contributionCount: 0 },
            { date: '2024-01-02', contributionCount: 0 },
        ];
        expect(calculateStreak(days).currentStreak).toBe(0);
        expect(calculateStreak(days).longestStreak).toBe(0);
    });

    test('today is zero but yesterday had contributions', () => {
        const days = [
            { date: '2024-01-01', contributionCount: 2 },
            { date: '2024-01-02', contributionCount: 3 },
            { date: '2024-01-03', contributionCount: 0 }, // today — dont break streak
        ];
        // Should still count yesterday's streak
        expect(calculateStreak(days).currentStreak).toBe(2);
    });
});

// --- calculateLanguageStats tests ---

describe('calculateLanguageStats', () => {

    test('returns empty array for no repos', () => {
        expect(calculateLanguageStats([])).toEqual([]);
    });

    test('counts languages correctly', () => {
        const repos = [
            { language: 'JavaScript' },
            { language: 'JavaScript' },
            { language: 'TypeScript' },
            { language: null }, // should be skipped
        ];
        const result = calculateLanguageStats(repos);
        expect(result[0]).toEqual({ language: 'JavaScript', count: 2 });
        expect(result[1]).toEqual({ language: 'TypeScript', count: 1 });
    });

    test('returns top 5 only', () => {
        const repos = [
            { language: 'JavaScript' },
            { language: 'TypeScript' },
            { language: 'Python' },
            { language: 'Rust' },
            { language: 'Go' },
            { language: 'Java' },
            { language: 'C++' },
        ];
        expect(calculateLanguageStats(repos).length).toBe(5);
    });

    test('sorts by count descending', () => {
        const repos = [
            { language: 'Python' },
            { language: 'JavaScript' },
            { language: 'JavaScript' },
            { language: 'JavaScript' },
        ];
        const result = calculateLanguageStats(repos);
        expect(result[0].language).toBe('JavaScript');
        expect(result[0].count).toBe(3);
    });
});

// --- calculateTotalStars tests ---

describe('calculateTotalStars', () => {

    test('returns 0 for empty repos', () => {
        expect(calculateTotalStars([])).toBe(0);
    });

    test('sums stars correctly', () => {
        const repos = [
            { stars: 10 },
            { stars: 5 },
            { stars: 3 },
        ];
        expect(calculateTotalStars(repos)).toBe(18);
    });
});

describe('withRetry', () => {

    test('returns result on first success', async () => {
        const fn = jest.fn().mockResolvedValue('success');
        const result = await withRetry(fn);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('retries on transient error and succeeds', async () => {
        const fn = jest.fn()
            // First call fails with transient error
            .mockRejectedValueOnce(new Error('Network timeout'))
            // Second call succeeds
            .mockResolvedValueOnce('success');

        // Use baseDelay of 0 for tests — don't actually wait 2 seconds
        const result = await withRetry(fn, 2, 0);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('does not retry permanent errors', async () => {
        const fn = jest.fn()
            .mockRejectedValue(new Error('GITHUB_TOKEN_REVOKED'));

        await expect(withRetry(fn, 2, 0))
            .rejects
            .toThrow('GITHUB_TOKEN_REVOKED');

        // Should only have been called once — no retries
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('throws after exhausting all retries', async () => {
        const fn = jest.fn()
            .mockRejectedValue(new Error('Network timeout'));

        await expect(withRetry(fn, 2, 0))
            .rejects
            .toThrow('Network timeout');

        // 1 initial attempt + 2 retries = 3 total calls
        expect(fn).toHaveBeenCalledTimes(3);
    });
});