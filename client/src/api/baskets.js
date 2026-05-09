import { api } from './client'

export function listBaskets(userId)
{
    if (userId === undefined || userId === null) return api('/baskets')
    return api(`/baskets?userId=${userId}`)
}

export function getDraftBasket(userId)
{
    return api(`/baskets?userId=${userId}&status=draft&_limit=1`).then(arr => arr[0] || null)
}

export function createBasket(payload)
{
    return api('/baskets', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export function patchBasket(id, body)
{
    return api(`/baskets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
    })
}

// Add an item to the user's draft basket. Creates the draft if it does not exist.
// If the item is already in the basket, the quantity is increased instead of duplicating the line.
export async function addToBasket(userId, itemId, qty = 1)
{
    const draft = await getDraftBasket(userId)
    if (!draft) {
        return createBasket({
            userId,
            status: 'draft',
            items: [{ itemId, qty }],
            submittedAt: null,
            decidedAt: null,
            decidedBy: null,
            decisionNote: ''
        })
    }
    const idx = draft.items.findIndex(line => line.itemId === itemId)
    const newItems = idx >= 0
        ? draft.items.map((line, i) => i === idx ? { ...line, qty: line.qty + qty } : line)
        : [...draft.items, { itemId, qty }]
    return patchBasket(draft.id, { items: newItems })
}
