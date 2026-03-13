import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [mobile, setMobile] = useState('')
    const [emergency, setEmergency] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const submit = async (evt) => {
        evt.preventDefault()
        setError('')

        if (password !== confirm) {
            setError('Passwords do not match')
            return
        }

        if (!mobile.trim() || !emergency.trim()) {
            setError('Please enter a mobile and an emergency contact number')
            return
        }

        setLoading(true)
        try {
            await register({ name, email, password, mobile, emergencyMobile: emergency })
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Unable to create account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
                <p className="text-sm text-gray-500 mb-6">Sign up to access health monitoring and emergency alerts.</p>

                {error && (
                    <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Full name</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="Your name"
                        />
                    </label>

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
                        <span className="text-sm font-medium text-gray-700">Mobile number</span>
                        <input
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            type="tel"
                            required
                            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="+91 98765 43210"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Emergency contact</span>
                        <input
                            value={emergency}
                            onChange={(e) => setEmergency(e.target.value)}
                            type="tel"
                            required
                            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="+91 91234 56789"
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
                            placeholder="Create a password"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Confirm password</span>
                        <input
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            type="password"
                            required
                            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="Re-enter password"
                        />
                    </label>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating account…' : 'Create account'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Already registered?{' '}
                    <Link to="/login" className="text-rose-600 font-semibold hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
