import { useEffect, useState, useMemo } from 'react'
import axiosInstance from '../api/axiosInstance.js'

const SORT_OPTIONS = [
    { label: 'STARS', value: 'stars' },
    { label: 'FORKS', value: 'forks' },
    { label: 'UPDATED', value: 'updated' }
]

// Individual repo card
const RepoCard = ({ repo }) => (
    <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border p-4 transition-all duration-150"
        style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#FFE500'
            e.currentTarget.style.backgroundColor = '#1a1a1a'
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#2a2a2a'
            e.currentTarget.style.backgroundColor = '#141414'
        }}
    >
        {/* Repo name + visibility */}
        <div className="flex items-start justify-between gap-2 mb-2">
            <span className="font-mono text-sm font-bold truncate"
                style={{ color: '#FFFFFF' }}>
                {repo.name}
            </span>
            <span className="font-mono text-xs px-1.5 py-0.5 border shrink-0"
                style={{
                    color: '#444444',
                    borderColor: '#2a2a2a',
                    fontSize: '10px'
                }}>
                {repo.isPrivate ? 'PRIVATE' : 'PUBLIC'}
            </span>
        </div>

        {/* Description */}
        <p className="text-xs mb-3 line-clamp-2"
            style={{ color: '#888888' }}>
            {repo.description || '—'}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4">
            {repo.language && (
                <span className="font-mono text-xs"
                    style={{ color: '#FFE500' }}>
                    {repo.language}
                </span>
            )}
            <span className="font-mono text-xs flex items-center gap-1"
                style={{ color: '#444444' }}>
                ★ <span style={{ color: '#FFFFFF' }}>{repo.stars}</span>
            </span>
            <span className="font-mono text-xs flex items-center gap-1"
                style={{ color: '#444444' }}>
                ⑂ <span style={{ color: '#FFFFFF' }}>{repo.forks}</span>
            </span>
            <span className="font-mono text-xs ml-auto"
                style={{ color: '#444444' }}>
                {new Date(repo.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }).toUpperCase()}
            </span>
        </div>
    </a>
)

export default function TopRepos() {
    const [repos, setRepos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filter and sort state
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('stars')
    const [languageFilter, setLanguageFilter] = useState('ALL')

    useEffect(() => {
        axiosInstance.get('/api/stats/repos')
            .then(res => {
                setRepos(res.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load repositories')
                setLoading(false)
            })
    }, [])

    // Extract unique languages from all repos for the filter dropdown
    // useMemo — only recomputes when repos changes, not on every render
    const languages = useMemo(() => {
        const langs = repos
            .map(r => r.language)
            .filter(Boolean) // remove null/undefined
        return ['ALL', ...new Set(langs)] // deduplicate with Set
    }, [repos])

    // Apply all filters and sorting — also memoized
    // Recomputes whenever search, sortBy, languageFilter, or repos changes
    const filteredRepos = useMemo(() => {
        return repos
            // Step 1: filter by search query
            .filter(repo =>
                repo.name.toLowerCase().includes(search.toLowerCase())
            )
            // Step 2: filter by language
            .filter(repo =>
                languageFilter === 'ALL' ? true : repo.language === languageFilter
            )
            // Step 3: sort
            .sort((a, b) => {
                if (sortBy === 'stars') return b.stars - a.stars
                if (sortBy === 'forks') return b.forks - a.forks
                if (sortBy === 'updated') {
                    return new Date(b.updatedAt) - new Date(a.updatedAt)
                }
                return 0
            })
    }, [repos, search, sortBy, languageFilter])

    if (loading) {
        return (
            <div className="border p-6"
                style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 animate-pulse"
                        style={{ backgroundColor: '#FFE500' }} />
                    <span className="font-mono text-xs uppercase tracking-widest"
                        style={{ color: '#444444' }}>
                        Loading Repositories...
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="border p-4 h-28 animate-pulse"
                            style={{
                                backgroundColor: '#1a1a1a',
                                borderColor: '#2a2a2a'
                            }} />
                    ))}
                </div>
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
        <div className="border p-6"
            style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2"
                        style={{ backgroundColor: '#FFE500' }} />
                    <span className="font-mono text-xs uppercase tracking-widest font-bold"
                        style={{ color: '#FFFFFF' }}>
                        Repositories
                    </span>
                    <span className="stat-number text-lg font-black"
                        style={{ color: '#FFE500' }}>
                        {filteredRepos.length}
                        <span className="font-mono text-xs ml-1 font-normal"
                            style={{ color: '#444444' }}>
                            / {repos.length}
                        </span>
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-6">
                {/* Search */}
                <input
                    type="text"
                    placeholder="SEARCH REPOS..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-48 px-3 py-2 font-mono text-xs uppercase bg-transparent border outline-none placeholder-gray-700"
                    style={{
                        borderColor: '#2a2a2a',
                        color: '#FFFFFF',
                    }}
                    onFocus={e => e.target.style.borderColor = '#FFE500'}
                    onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />

                {/* Language filter */}
                <select
                    value={languageFilter}
                    onChange={e => setLanguageFilter(e.target.value)}
                    className="px-3 py-2 font-mono text-xs uppercase border outline-none cursor-pointer"
                    style={{
                        backgroundColor: '#0d0d0d',
                        borderColor: '#2a2a2a',
                        color: '#888888'
                    }}
                >
                    {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>

                {/* Sort buttons */}
                <div className="flex gap-1">
                    {SORT_OPTIONS.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => setSortBy(value)}
                            className="font-mono text-xs px-3 py-2 border transition-colors uppercase"
                            style={{
                                backgroundColor: sortBy === value ? '#FFE500' : 'transparent',
                                color: sortBy === value ? '#0d0d0d' : '#444444',
                                borderColor: sortBy === value ? '#FFE500' : '#2a2a2a'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Repo grid */}
            {filteredRepos.length === 0 ? (
                <div className="border p-8 text-center"
                    style={{ borderColor: '#2a2a2a' }}>
                    <p className="font-mono text-xs uppercase"
                        style={{ color: '#444444' }}>
                        NO REPOS MATCH YOUR FILTERS
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredRepos.map(repo => (
                        <RepoCard key={repo.name} repo={repo} />
                    ))}
                </div>
            )}
        </div>
    )
}