import { api } from './client'

export function listItems()
{
    return api('/items')
}

export function getItem(id)
{
    return api(`/items/${id}`)
}

export function createItem(payload)
{
    return api('/items', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export function patchItem(id, payload)
{
    return api(`/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    })
}

export function deleteItem(id)
{
    return api(`/items/${id}`, { method: 'DELETE' })
}
