import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import { getUser, patchUser } from '../api/users'
import { getToken, setToken } from './storage'
import { decodeJwt } from './jwt'

const AuthContext = createContext(null)

function basicUserFromToken(token)
{
    const decoded = decodeJwt(token)
    if (!decoded) return null
    return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role || 'client'
    }
}

async function fetchFullUser(id)
{
    if (!id) return null
    try { return await getUser(id) } catch (_) { return null }
}

export function AuthProvider({ children })
{
    const [user, setUser] = useState(() => basicUserFromToken(getToken()))

    // After mount, refresh the user record from the server. The JWT issued by
    // json-server-auth does not carry the role claim, so the db record is the
    // authoritative source for role and profile fields.
    useEffect(() => {
        const tok = getToken()
        if (!tok) return
        const basic = basicUserFromToken(tok)
        if (!basic?.id) return
        fetchFullUser(basic.id).then(full => {
            if (full) setUser({ ...basic, ...full, id: basic.id })
        })
    }, [])

    async function login(email, password) {
        const data = await apiLogin(email, password)
        setToken(data.accessToken)
        const basic = basicUserFromToken(data.accessToken) || { email }
        const full = await fetchFullUser(basic.id)
        const u = { ...basic, ...(full || {}), id: basic.id || full?.id }
        setUser(u)
        return u
    }

    async function register(payload) {
        const data = await apiRegister(payload)
        setToken(data.accessToken)
        const basic = basicUserFromToken(data.accessToken) || { email: payload.email }
        const id = basic.id

        // json-server-auth may not save extra fields on signup. Patch the
        // record so role and profile data stick. Owner write is allowed by
        // the 640 rule on /users.
        if (id) {
            try {
                await patchUser(id, {
                    role: payload.role,
                    name: payload.name,
                    address: payload.address,
                    phone: payload.phone
                })
            } catch (_) { /* tolerate - middleware may reject role bumps */ }
        }

        const full = await fetchFullUser(id)
        const u = { ...basic, ...(full || {}), id }
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
