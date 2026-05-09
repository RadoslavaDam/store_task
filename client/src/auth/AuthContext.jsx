import { createContext, useContext, useState } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import { getToken, setToken } from './storage'
import { decodeJwt } from './jwt'

const AuthContext = createContext(null)

function userFromToken(token)
{
    const decoded = decodeJwt(token)
    if (!decoded) return null
    return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role || 'client'
    }
}

export function AuthProvider({ children })
{
    const [user, setUser] = useState(() => userFromToken(getToken()))

    async function login(email, password) {
        const data = await apiLogin(email, password)
        setToken(data.accessToken)
        const u = userFromToken(data.accessToken) || { email, role: 'client' }
        setUser(u)
        return u
    }

    async function register(payload) {
        const data = await apiRegister(payload)
        setToken(data.accessToken)
        const u = userFromToken(data.accessToken) || { email: payload.email, role: payload.role || 'client' }
        setUser(u)
        return u
    }

    function logout() {
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth()
{
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
