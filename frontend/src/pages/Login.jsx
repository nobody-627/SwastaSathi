import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
    const { user, login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true })
        }
    }, [user, navigate])

    const submit = async (evt) => {
        evt.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email.trim(), password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Unable to sign in')
        } finally {
            setLoading(false)
        }
    }

    const goGoogle = () => {
        window.location.href = '/api/auth/google'
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to SwasthSathi</h1>
                <p className="text-sm text-gray-500 mb-6">Use your email and password to continue.</p>

                {error && (
                    <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Email</span>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="you@example.com"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Password</span>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            required
                            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="********"
                        />
                    </label>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={goGoogle}
                        disabled={loading}
                    >
                        Continue with Google
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    New to SwasthSathi?{' '}
                    <Link to="/register" className="text-rose-600 font-semibold hover:underline">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    )
}
