import { getToken } from '../auth/storage'

const BASE = '/api'

export async function api(path, options = {})
{
    const token = getToken()
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    }
    const res = await fetch(BASE + path, { ...options, headers })
    if (!res.ok) {
        let msg = `Request failed: ${res.status}`
        try {
            const data = await res.json()
            msg = data.error || data.message || msg
        } catch (_) {
            try { msg = await res.text() || msg } catch (_) {}
        }
        throw new Error(msg)
    }
    if (res.status === 204) return null
    return res.json()
}
