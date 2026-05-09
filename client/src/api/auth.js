import { api } from './client'

export function login(email, password)
{
    return api('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    })
}

export function register(payload)
{
    return api('/register', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}
