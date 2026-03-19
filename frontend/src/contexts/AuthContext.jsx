import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAgentStore } from '../store/agentStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const setUserEmergencyPhone = useAgentStore(state => state.setUserEmergencyPhone)

    useEffect(() => {
        // Set demo user immediately for development
        const mockUser = {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@swasthsathi.com',
            mobile: '+1234567890',
            emergency_mobile: '+0987654321'
        }

        const tokenFromUrl = new URLSearchParams(window.location.search).get('token')
        if (tokenFromUrl) {
            window.localStorage.setItem('authToken', tokenFromUrl)
            const url = new URL(window.location.href)
            url.searchParams.delete('token')
            window.history.replaceState({}, '', url.toString())
        }

        const token = window.localStorage.getItem('authToken')
        
        // Immediately set the demo user for development
        setUser(mockUser)
        setUserEmergencyPhone(mockUser)
        setLoading(false)
        
        // Try to load real user data if token exists (but don't block)
        if (token) {
            api.auth.me()
                .then((res) => {
                    setUser(res.user)
                    setUserEmergencyPhone(res.user)
                })
                .catch(() => {
                    // Keep demo user if real auth fails
                })
        }
<<<<<<< HEAD
=======

        api.auth.me()
            .then((res) => {
                setUser(res.user)
                setUserEmergencyPhone(res.user)
            })
            .catch((err) => {
                // Only clear token when backend confirms token is invalid.
                // Network/transient failures should not force logout.
                if (err?.status === 401 || err?.status === 403) {
                    window.localStorage.removeItem('authToken')
                    setUser(null)
                }
            })
            .finally(() => setLoading(false))
>>>>>>> 70823d0 (Bug fixing)
    }, [])

    const login = async (email, password) => {
        // Mock login for development
        const mockUser = {
            id: 'demo-user',
            name: 'Demo User',
            email: email,
            mobile: '+1234567890',
            emergency_mobile: '+0987654321'
        }
        
        window.localStorage.setItem('authToken', 'demo-token')
        setUser(mockUser)
        setUserEmergencyPhone(mockUser)
        return mockUser
    }

    const register = async (data) => {
        // Mock register for development
        const mockUser = {
            id: 'demo-user',
            name: data.name || 'Demo User',
            email: data.email,
            mobile: data.mobile || '+1234567890',
            emergency_mobile: data.emergency_mobile || '+0987654321'
        }
        
        window.localStorage.setItem('authToken', 'demo-token')
        setUser(mockUser)
        setUserEmergencyPhone(mockUser)
        return mockUser
    }

    const logout = async () => {
        try {
            await api.auth.logout()
        } catch {
            // ignore
        }
        window.localStorage.removeItem('authToken')
        setUser(null)
        navigate('/login')
    }

    const value = useMemo(
        () => ({ user, loading, login, register, logout }),
        [user, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
