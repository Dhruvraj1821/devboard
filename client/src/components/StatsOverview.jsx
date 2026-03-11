import { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance.js'

const StatCard = ({ label, value, unit, accent }) => (
    <div className="border p-5 flex flex-col justify-between"
        style={{
            backgroundColor: '#141414',
            borderColor: accent ? '#FFE500' : '#2a2a2a',
            borderWidth: accent ? '2px' : '1px'
        }}>
        <span className="font-mono text-xs uppercase tracking-widest"
            style={{ color: '#444444' }}>
            {label}
        </span>
        <div className="mt-3">
            <span className="stat-number font-black"
                style={{
                    fontSize: '2.5rem',
                    lineHeight: 1,
                    color: accent ? '#FFE500' : '#FFFFFF'
                }}>
                {value ?? '—'}
            </span>
            {unit && (
                <span className="font-mono text-xs ml-2 uppercase"
                    style={{ color: '#444444' }}>
                    {unit}
                </span>
            )}
        </div>
    </div>
)

export default function StatsOverview() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        axiosInstance.get('/api/stats/overview')
            .then(res => {
                setStats(res.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load stats')
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="border p-5 h-28 animate-pulse"
                        style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }} />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="border p-6"
                style={{ backgroundColor: '#141414', borderColor: '#FF3131' }}>
                <p className="font-mono text-xs uppercase"
                    style={{ color: '#FF3131' }}>
                    ✕ {error}
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2" style={{ backgroundColor: '#FFE500' }} />
                <span className="font-mono text-xs uppercase tracking-widest font-bold"
                    style={{ color: '#FFFFFF' }}>
                    Overview
                </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard
                    label="Commits"
                    value={stats.totalCommits?.toLocaleString()}
                    accent={true}
                />
                <StatCard
                    label="Pull Requests"
                    value={stats.totalPRs?.toLocaleString()}
                />
                <StatCard
                    label="Issues"
                    value={stats.totalIssues?.toLocaleString()}
                />
                <StatCard
                    label="Cur. Streak"
                    value={stats.currentStreak}
                    unit="days"
                />
                <StatCard
                    label="Best Streak"
                    value={stats.longestStreak}
                    unit="days"
                />
                <StatCard
                    label="Total Stars"
                    value={stats.totalStars?.toLocaleString()}
                />
            </div>
        </div>
    )
}