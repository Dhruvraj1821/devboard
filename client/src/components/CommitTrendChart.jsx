import { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts'
import axiosInstance from '../api/axiosInstance.js'

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="border px-3 py-2"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#FFE500' }}>
                <p className="font-mono text-xs uppercase"
                    style={{ color: '#444444' }}>
                    {label}
                </p>
                <p className="stat-number text-lg font-black"
                    style={{ color: '#FFE500' }}>
                    {payload[0].value}
                    <span className="font-mono text-xs ml-1 font-normal"
                        style={{ color: '#444444' }}>
                        commits
                    </span>
                </p>
            </div>
        )
    }
    return null
}

export default function CommitTrendChart() {
    const [trends, setTrends] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [period, setPeriod] = useState(30)

    useEffect(() => {
        setLoading(true)
        axiosInstance.get(`/api/stats/trends?period=${period}`)
            .then(res => {
                // Format dates for display on X axis
                const formatted = res.data.map(day => ({
                    ...day,
                    // Show only month/day — full date is too long
                    label: new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    }).toUpperCase()
                }))
                setTrends(formatted)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load trend data')
                setLoading(false)
            })
    }, [period]) // re-fetch when period changes

    if (loading) {
        return (
            <div className="border p-6 h-64 animate-pulse"
                style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }} />
        )
    }

    if (error) {
        return (
            <div className="border p-6"
                style={{ backgroundColor: '#141414', borderColor: '#FF3131' }}>
                <p className="font-mono text-xs uppercase"
                    style={{ color: '#FF3131' }}>✕ {error}</p>
            </div>
        )
    }

    const totalInPeriod = trends.reduce((sum, day) => sum + day.count, 0)

    return (
        <div className="border p-6"
            style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2" style={{ backgroundColor: '#FFE500' }} />
                    <span className="font-mono text-xs uppercase tracking-widest font-bold"
                        style={{ color: '#FFFFFF' }}>
                        Commit Trend
                    </span>
                    <span className="stat-number text-lg font-black"
                        style={{ color: '#FFE500' }}>
                        {totalInPeriod}
                        <span className="font-mono text-xs ml-1 font-normal"
                            style={{ color: '#444444' }}>
                            TOTAL
                        </span>
                    </span>
                </div>

                {/* Period selector */}
                <div className="flex gap-1">
                    {[7, 30, 90].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className="font-mono text-xs px-3 py-1 border transition-colors uppercase"
                            style={{
                                backgroundColor: period === p ? '#FFE500' : 'transparent',
                                color: period === p ? '#0d0d0d' : '#444444',
                                borderColor: period === p ? '#FFE500' : '#2a2a2a'
                            }}
                        >
                            {p}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trends}
                    margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>

                    <CartesianGrid
                        strokeDasharray="1 4"
                        stroke="#1a1a1a"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="label"
                        tick={{
                            fill: '#444444',
                            fontSize: 9,
                            fontFamily: 'SF Mono, Fira Code, monospace'
                        }}
                        axisLine={{ stroke: '#2a2a2a' }}
                        tickLine={false}
                        // Only show every 7th label to avoid crowding
                        interval={Math.floor(trends.length / 5)}
                    />

                    <YAxis
                        tick={{
                            fill: '#444444',
                            fontSize: 9,
                            fontFamily: 'SF Mono, Fira Code, monospace'
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#2a2a2a', strokeWidth: 1 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#FFE500"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                            r: 4,
                            fill: '#FFE500',
                            stroke: '#0d0d0d',
                            strokeWidth: 2
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}