import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Prediction from './pages/Prediction'

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const isDashboard = pathname === '/dashboard'

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className={isDashboard ? 'pt-16' : ''}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="*"          element={<Home />} />
        </Routes>
      </main>
    </div>
  )
}
