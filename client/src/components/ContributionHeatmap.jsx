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
                // res.data is array of { date, contributionCount, weekday }
                // react-calendar-heatmap expects { date, count }
                const transformed = res.data.map(day => ({
                    date: day.date,
                    count: day.contributionCount
                }))

                // Calculate total contributions for the header
                const total = res.data.reduce(
                    (sum, day) => sum + day.contributionCount, 0
                )

                setCalendarData(transformed)
                setTotalContributions(total)
                setLoading(false)
            })
            .catch(err => {
                setError('Failed to load contribution data')
                setLoading(false)
            })
    }, []) // empty array — fetch once when component mounts

   
    if (loading) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="h-32 bg-gray-800 rounded animate-pulse" />
            </div>
        )
    }

    
    if (error) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-green-400 text-sm hover:underline"
                >
                    Retry
                </button>
            </div>
        )
    }

   
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

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">
                    Contribution Activity
                </h2>
                <span className="text-gray-400 text-sm">
                    {totalContributions} contributions in the last year
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
            <div className="flex items-center gap-1 mt-3 justify-end">
                <span className="text-gray-500 text-xs mr-1">Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-800" />
                <div className="w-3 h-3 rounded-sm" style={{backgroundColor: '#0e4429'}} />
                <div className="w-3 h-3 rounded-sm" style={{backgroundColor: '#006d32'}} />
                <div className="w-3 h-3 rounded-sm" style={{backgroundColor: '#26a641'}} />
                <div className="w-3 h-3 rounded-sm" style={{backgroundColor: '#39d353'}} />
                <span className="text-gray-500 text-xs ml-1">More</span>
            </div>
        </div>
    )
}