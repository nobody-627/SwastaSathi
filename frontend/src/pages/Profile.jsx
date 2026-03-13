import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
    const { user, loading, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [loading, user, navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading profile…</div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your account and emergency contact information.</p>
                    </div>
                    <Button variant="soft" onClick={() => navigate('/dashboard')}>
                        Dashboard
                    </Button>
                </div>

                <div className="mt-8 grid gap-6">
                    <div className="bg-gray-50 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700">Personal</h2>
                        <div className="mt-2 text-sm text-gray-600 space-y-2">
                            <div>
                                <span className="font-semibold text-gray-800">Name: </span>
                                {user.name}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-800">Email: </span>
                                {user.email}
                            </div>
                            {user.mobile && (
                                <div>
                                    <span className="font-semibold text-gray-800">Mobile: </span>
                                    {user.mobile}
                                </div>
                            )}
                            {user.emergency_mobile && (
                                <div>
                                    <span className="font-semibold text-gray-800">Emergency contact: </span>
                                    {user.emergency_mobile}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="danger" onClick={logout}>
                            Log out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
