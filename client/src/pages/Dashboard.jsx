import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance.js'
import ContributionHeatmap from '../components/ContributionHeatmap.jsx'
import StatsOverview from '../components/StatsOverview.jsx'
import LanguagePieChart from '../components/LanguagePieChart.jsx'
import CommitTrendChart from '../components/CommitTrendChart.jsx'
import TopRepos from '../components/TopRepos.jsx'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    axiosInstance.get('/api/auth/me')
        .then(async res => {
            if (!res.data.lastSynced) {
                setSyncing(true)
                try {
                    await axiosInstance.post('/api/sync')
                    setUser(res.data)
                    setRefreshKey(prev => prev + 1)
                } catch (error) {
                    console.error('Auto-sync failed:', error)
                    setUser(res.data)
                } finally {
                    setSyncing(false)
                }
            } else {
                setUser(res.data)
            }
        })
        .catch(() => navigate('/'))
}, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('devboard_token')
    navigate('/')
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await axiosInstance.post('/api/sync')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      alert('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  if (!user || syncing) {
    return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: '#0d0d0d' }}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-4 h-4 border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#FFE500', borderTopColor: 'transparent' }} />
                <span className="font-mono text-sm" style={{ color: '#888888' }}>
                    {syncing ? 'SYNCING YOUR GITHUB DATA...' : 'LOADING...'}
                </span>
                {syncing && (
                    <span className="font-mono text-xs" style={{ color: '#444444' }}>
                        THIS ONLY HAPPENS ONCE
                    </span>
                )}
            </div>
        </div>
    )
}

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d0d0d', color: '#FFFFFF' }}>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10"
    style={{ borderColor: '#2a2a2a', backgroundColor: '#0d0d0d' }}>

    <span className="font-black text-lg tracking-tighter">
        DEV<span style={{ color: '#FFE500' }}>BOARD</span>
    </span>

    <div className="flex items-center gap-2">
        {/* Avatar only — no username text on mobile */}
        <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-6 h-6 border"
            style={{ borderColor: '#2a2a2a' }}
        />

        <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-1.5 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-150 disabled:opacity-40"
            style={{
                backgroundColor: syncing ? '#1a1a1a' : '#FFE500',
                color: syncing ? '#888888' : '#0d0d0d',
                border: `2px solid ${syncing ? '#2a2a2a' : '#FFE500'}`
            }}
            onMouseEnter={e => {
                if (!syncing) {
                    e.currentTarget.style.backgroundColor = '#0d0d0d'
                    e.currentTarget.style.color = '#FFE500'
                }
            }}
            onMouseLeave={e => {
                if (!syncing) {
                    e.currentTarget.style.backgroundColor = '#FFE500'
                    e.currentTarget.style.color = '#0d0d0d'
                }
            }}
        >
            {syncing ? 'SYNCING...' : 'SYNC'}
        </button>

        <button
            onClick={handleLogout}
            className="px-3 py-1.5 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-150 border"
            style={{
                backgroundColor: 'transparent',
                color: '#444444',
                borderColor: '#2a2a2a'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#FF3131'
                e.currentTarget.style.color = '#FF3131'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.color = '#444444'
            }}
        >
            EXIT
        </button>
    </div>
</nav>

      {/* Page header */}
      <div className="px-8 py-6 border-b"
        style={{ borderColor: '#2a2a2a' }}>
        <div className="flex items-end justify-between max-w-6xl mx-auto">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1"
              style={{ color: '#444444' }}>
              Dashboard / {user.username}
            </p>
            <h2 className="text-3xl font-black tracking-tighter"
              style={{ color: '#FFFFFF' }}>
              YOUR STATS
              <span style={{ color: '#FFE500' }}>.</span>
            </h2>
          </div>
          <p className="font-mono text-xs pb-1"
            style={{ color: '#444444' }}>
            {user.lastSynced
              ? `LAST SYNC: ${new Date(user.lastSynced).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`
              : 'NEVER SYNCED'
            }
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        <StatsOverview refreshKey={refreshKey}/>
        <ContributionHeatmap refreshKey={refreshKey}/>

    {/* Two column layout for language + trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LanguagePieChart refreshKey={refreshKey}/>
          <CommitTrendChart refreshKey={refreshKey}/>
        </div>
        <TopRepos refreshKey={refreshKey}/>
      </main>

      {/* Footer */}
      <div className="px-8 py-4 border-t mt-8"
        style={{ borderColor: '#2a2a2a' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs" style={{ color: '#2a2a2a' }}>
            DEVBOARD · MERN STACK
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5"
              style={{ backgroundColor: '#00FF94' }} />
            <span className="font-mono text-xs" style={{ color: '#2a2a2a' }}>
              CONNECTED
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}