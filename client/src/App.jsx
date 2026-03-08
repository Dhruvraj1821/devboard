import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AuthSuccess from './pages/AuthSuccess.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <Routes>
      {/* Landing page — has the GitHub login button */}
      <Route path="/" element={<LandingPage />} />

      {/* GitHub OAuth redirects here with ?token=xxx */}
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* Protected dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}