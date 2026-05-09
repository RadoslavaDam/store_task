import { api } from './client'

export function listItems()
{
    return api('/items')
}

export function getItem(id)
{
    return api(`/items/${id}`)
}
