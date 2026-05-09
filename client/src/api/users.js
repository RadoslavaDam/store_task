import { api } from './client'

export function listUsers(query = '')
{
    return api(`/users${query ? '?' + query : ''}`)
}

export function getUser(id)
{
    return api(`/users/${id}`)
}

export function patchUser(id, body)
{
    return api(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
    })
}

export function deleteUser(id)
{
    return api(`/users/${id}`, { method: 'DELETE' })
}

export async function checkMasterExists()
{
    const arr = await api('/users?role=master&_limit=1')
    return Array.isArray(arr) && arr.length > 0
}
