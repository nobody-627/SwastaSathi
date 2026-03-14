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
        const tokenFromUrl = new URLSearchParams(window.location.search).get('token')
        if (tokenFromUrl) {
            window.localStorage.setItem('authToken', tokenFromUrl)
            const url = new URL(window.location.href)
            url.searchParams.delete('token')
            window.history.replaceState({}, '', url.toString())
        }

        const token = window.localStorage.getItem('authToken')
        if (!token) {
            setLoading(false)
            return
        }

        api.auth.me()
            .then((res) => {
                setUser(res.user)
                setUserEmergencyPhone(res.user)
            })
            .catch(() => {
                window.localStorage.removeItem('authToken')
                setUser(null)
            })
            .finally(() => setLoading(false))
    }, [])

    const login = async (email, password) => {
        const response = await api.auth.login(email, password)
        window.localStorage.setItem('authToken', response.token)
        setUser(response.user)
        setUserEmergencyPhone(response.user)
        return response.user
    }

    const register = async (data) => {
        const response = await api.auth.register(data)
        window.localStorage.setItem('authToken', response.token)
        setUser(response.user)
        setUserEmergencyPhone(response.user)
        return response.user
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
