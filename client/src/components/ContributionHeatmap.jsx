import { useEffect, useState } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import axiosInstance from '../api/axiosInstance.js'

export default function ContributionHeatmap() {
    const [calendarData, setCalendarData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [totalContributions, setTotalContributions] = useState(0)

    useEffect(() => {
        axiosInstance.get('/api/stats/calendar')
            .then(res => {
                const transformed = res.data.map(day => ({
                    date: day.date,
                    count: day.contributionCount
                }))
                const total = res.data.reduce(
                    (sum, day) => sum + day.contributionCount, 0
                )
                setCalendarData(transformed)
                setTotalContributions(total)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load contribution data')
                setLoading(false)
            })
    }, [])

    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 1)

    const getColorClass = (value) => {
        if (!value || value.count === 0) return 'color-empty'
        if (value.count <= 2) return 'color-low'
        if (value.count <= 5) return 'color-mid'
        if (value.count <= 9) return 'color-high'
        return 'color-max'
    }

    if (loading) {
        return (
            <div className="border p-6"
                style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 animate-pulse"
                        style={{ backgroundColor: '#FFE500' }} />
                    <span className="font-mono text-xs uppercase tracking-widest"
                        style={{ color: '#444444' }}>
                        Loading Activity...
                    </span>
                </div>
                <div className="h-32 animate-pulse"
                    style={{ backgroundColor: '#1a1a1a' }} />
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
                <button
                    onClick={() => window.location.reload()}
                    className="mt-3 font-mono text-xs uppercase tracking-widest border px-3 py-1 transition-colors"
                    style={{ borderColor: '#2a2a2a', color: '#888888' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#FFE500'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                >
                    [ RETRY ]
                </button>
            </div>
        )
    }

    return (
        <div className="border p-6"
            style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2"
                        style={{ backgroundColor: '#FFE500' }} />
                    <span className="font-mono text-xs uppercase tracking-widest font-bold"
                        style={{ color: '#FFFFFF' }}>
                        Contribution Activity
                    </span>
                </div>
                <span className="stat-number text-2xl font-black"
                    style={{ color: '#FFE500' }}>
                    {totalContributions.toLocaleString()}
                    <span className="font-mono text-xs ml-2 font-normal"
                        style={{ color: '#444444' }}>
                        CONTRIBUTIONS
                    </span>
                </span>
            </div>

            {/* Heatmap */}
            <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={calendarData}
                classForValue={getColorClass}
                tooltipDataAttrs={(value) => ({
                    'data-tip': value && value.date
                        ? `${value.count} contributions on ${value.date}`
                        : 'No contributions'
                })}
                showWeekdayLabels={true}
            />

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 justify-between">
                <span className="font-mono text-xs uppercase"
                    style={{ color: '#2a2a2a' }}>
                    {new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                    {' → '}
                    {new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs" style={{ color: '#444444' }}>LESS</span>
                    {['#1a1a1a', '#3d3500', '#7a6b00', '#ccb800', '#FFE500'].map(color => (
                        <div key={color} className="w-3 h-3"
                            style={{ backgroundColor: color }} />
                    ))}
                    <span className="font-mono text-xs" style={{ color: '#444444' }}>MORE</span>
                </div>
            </div>
        </div>
    )
}