import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance.js'
import ContributionHeatmap from '../components/ContributionHeatmap.jsx' // add this

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        axiosInstance.get('/api/auth/me')
            .then(res => setUser(res.data))
            .catch(() => navigate('/'))
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('devboard_token')
        navigate('/')
    }

    const handleSync = async () => {
        try {
            await axiosInstance.post('/api/sync')
            alert('Sync successful!')
            window.location.reload() // reload to show fresh data
        } catch (error) {
            alert('Sync failed — check console')
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navbar */}
            <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">
                    Dev<span className="text-green-400">Board</span>
                </h1>
                <div className="flex items-center gap-4">
                    <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-300 text-sm">{user.username}</span>
                    <button
                        onClick={handleSync}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-md transition-colors"
                    >
                        Sync
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main content */}
            <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">
                        Welcome back, {user.username} 👋
                    </h2>
                    <p className="text-gray-400 mt-1">
                        Here's your GitHub activity overview
                    </p>
                </div>

                {/* Contribution Heatmap */}
                <ContributionHeatmap />

                {/* More components coming in Steps 20-21 */}
            </main>
        </div>
    )
}