import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#token=')) {
      const token = hash.substring(7)
      localStorage.setItem('devboard_token', token)
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/github`
}

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0d0d0d', color: '#FFFFFF' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: '#2a2a2a' }}>
        <span className="font-black text-xl tracking-tighter">
          DEV<span style={{ color: '#FFE500' }}>BOARD</span>
        </span>
        <span className="text-xs font-mono" style={{ color: '#444444' }}>
          v1.0.0
        </span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-start justify-center px-8 md:px-16 max-w-4xl mx-auto w-full">

        {/* Tag */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2" style={{ backgroundColor: '#FFE500' }} />
          <span className="text-xs font-mono uppercase tracking-widest"
            style={{ color: '#888888' }}>
            GitHub Analytics
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none mb-6"
          style={{ color: '#FFFFFF' }}>
          YOUR
          <br />
          CODE.
          <br />
          <span style={{ color: '#FFE500' }}>LAID</span>
          <br />
          <span style={{
            WebkitTextStroke: '2px #FFE500',
            color: 'transparent'
          }}>
            BARE.
          </span>
        </h1>

        <p className="text-base mb-10 max-w-md leading-relaxed"
          style={{ color: '#888888' }}>
          Raw GitHub stats. No fluff. Contribution heatmaps,
          streak tracking, language breakdown, and top repos —
          all in one place.
        </p>

        {/* Features row */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[
            'HEATMAP', 'STREAKS', 'LANGUAGES', 'REPOS', 'TRENDS'
          ].map(label => (
            <span key={label}
              className="px-3 py-1 text-xs font-mono font-bold border"
              style={{
                borderColor: '#2a2a2a',
                color: '#444444',
                backgroundColor: '#141414'
              }}>
              {label}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleLogin}
          className="group flex items-center gap-3 px-8 py-4 font-black text-sm uppercase tracking-widest transition-all duration-150"
          style={{
            backgroundColor: '#FFE500',
            color: '#0d0d0d',
            border: '2px solid #FFE500'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#0d0d0d'
            e.currentTarget.style.color = '#FFE500'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#FFE500'
            e.currentTarget.style.color = '#0d0d0d'
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </button>

        <p className="mt-4 text-xs font-mono" style={{ color: '#444444' }}>
          OAuth 2.0 · Read-only · No passwords stored
        </p>
      </div>

      {/* Bottom bar */}
      <div className="px-8 py-4 border-t flex items-center justify-between"
        style={{ borderColor: '#2a2a2a' }}>
        <span className="text-xs font-mono" style={{ color: '#444444' }}>
          MERN · GitHub GraphQL API · node-cron
        </span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#00FF94' }} />
          <span className="text-xs font-mono" style={{ color: '#444444' }}>
            ONLINE
          </span>
        </div>
      </div>
    </div>
  )
}