import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Demo flow: send users to dashboard after "login"
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 gradient-card rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900">
            Swasth<span className="gradient-text">Sathi</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/pricing" className="text-gray-500 hover:text-rose-600 font-semibold hidden sm:block">Pricing</Link>
          <Button variant="secondary" onClick={() => navigate('/')}>Back to home</Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-100 p-8 lg:p-10">
            <div className="absolute inset-0 gradient-hero opacity-80" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/80 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                Secure Login
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                Welcome back to
                <span className="gradient-text block">SwasthSathi</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mb-6">
                Sign in to continue monitoring vitals, view AI reasoning, and manage your escalation contacts.
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                {["Live AI risk scoring every 3s", "Full audit log with reasoning", "One-click emergency escalation"]
                  .map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      {item}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <Card className="bg-white shadow-2xl border border-gray-100 max-w-lg w-full mx-auto">
            <div className="mb-6 text-center">
              <p className="inline-block bg-rose-50 text-rose-600 text-[11px] font-semibold px-3 py-1 rounded-full mb-3">Access your dashboard</p>
              <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
              <p className="text-sm text-gray-500 mt-1">Use your email and password to continue.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-gray-300 text-rose-500 focus:ring-rose-200"
                  />
                  Remember me
                </label>
                <a href="#" className="font-semibold text-rose-600 hover:text-rose-700">Forgot password?</a>
              </div>

              <Button variant="primary" className="w-full justify-center text-sm py-3">Sign in</Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400 font-semibold">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <Button variant="secondary" className="w-full justify-center text-sm" onClick={() => navigate('/dashboard')}>
                Continue as guest
              </Button>
              <Button variant="secondary" className="w-full justify-center text-sm" href="#">
                Sign in with SSO
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-6">
              No account yet? <Link to="/" className="text-rose-600 font-semibold hover:text-rose-700">Start free</Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
