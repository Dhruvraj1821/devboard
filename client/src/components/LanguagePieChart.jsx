import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import axiosInstance from '../api/axiosInstance.js'

// Electric yellow to dark yellow — stays on brand
const COLORS = ['#FFE500', '#CCB800', '#997A00', '#665200', '#332900']

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="border px-3 py-2"
                style={{
                    backgroundColor: '#0d0d0d',
                    borderColor: '#FFE500'
                }}>
                <p className="font-mono text-xs uppercase font-bold"
                    style={{ color: '#FFE500' }}>
                    {payload[0].name}
                </p>
                <p className="font-mono text-xs"
                    style={{ color: '#888888' }}>
                    {payload[0].value} repos
                </p>
            </div>
        )
    }
    return null
}

export default function LanguagePieChart() {
    const [languages, setLanguages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        axiosInstance.get('/api/stats/languages')
            .then(res => {
                setLanguages(res.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load language stats')
                setLoading(false)
            })
    }, [])

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

    const total = languages.reduce((sum, l) => sum + l.count, 0)

    return (
        <div className="border p-6"
            style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2" style={{ backgroundColor: '#FFE500' }} />
                <span className="font-mono text-xs uppercase tracking-widest font-bold"
                    style={{ color: '#FFFFFF' }}>
                    Languages
                </span>
            </div>

            <div className="flex items-center gap-6">
                {/* Pie chart */}
                <div className="w-40 h-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={languages}
                                dataKey="count"
                                nameKey="language"
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={65}
                                strokeWidth={0}
                            >
                                {languages.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                    {languages.map((lang, index) => {
                        const percentage = Math.round((lang.count / total) * 100)
                        return (
                            <div key={lang.language}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2"
                                            style={{ backgroundColor: COLORS[index] }} />
                                        <span className="font-mono text-xs uppercase"
                                            style={{ color: '#888888' }}>
                                            {lang.language}
                                        </span>
                                    </div>
                                    <span className="stat-number text-sm font-bold"
                                        style={{ color: '#FFFFFF' }}>
                                        {percentage}%
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="h-0.5 w-full"
                                    style={{ backgroundColor: '#1a1a1a' }}>
                                    <div className="h-0.5 transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: COLORS[index]
                                        }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}