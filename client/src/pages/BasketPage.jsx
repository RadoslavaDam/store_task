import { useEffect, useState, useCallback } from 'react'
import { listBaskets, patchBasket } from '../api/baskets'
import { listItems } from '../api/items'
import { useAuth } from '../auth/AuthContext'
import styles from '../styles/Basket.module.css'

export default function BasketPage()
{
    const { user } = useAuth()
    const [baskets, setBaskets] = useState([])
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const load = useCallback(() => {
        return Promise.all([listBaskets(user.id), listItems()]).then(([bs, it]) => {
            setBaskets(bs)
            setItems(it)
        })
    }, [user.id])

    useEffect(() => {
        load().catch(err => setError(err.message)).finally(() => setLoading(false))
    }, [load])

    function findItem(itemId) {
        return items.find(i => i.id === itemId) || { name: `Item #${itemId}`, price: 0 }
    }

    function basketTotal(basket) {
        return basket.items.reduce((sum, line) => {
            const it = findItem(line.itemId)
            return sum + (Number(it.price) || 0) * line.qty
        }, 0)
    }

    const draft = baskets.find(b => b.status === 'draft')
    const history = baskets
        .filter(b => b.status !== 'draft')
        .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))

    async function updateQty(line, newQty) {
        if (newQty < 1) return removeLine(line)
        setBusy(true)
        setError('')
        try {
            const newItems = draft.items.map(l => l.itemId === line.itemId ? { ...l, qty: newQty } : l)
            await patchBasket(draft.id, { items: newItems })
            await load()
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    async function removeLine(line) {
        setBusy(true)
        setError('')
        try {
            const newItems = draft.items.filter(l => l.itemId !== line.itemId)
            await patchBasket(draft.id, { items: newItems })
            await load()
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    async function submitBasket() {
        if (!draft || draft.items.length === 0) return
        setBusy(true)
        setError('')
        try {
            await patchBasket(draft.id, {
                status: 'submitted',
                submittedAt: new Date().toISOString()
            })
            await load()
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    if (loading) return <div className={styles.page}><p>Loading basket...</p></div>

    return (
        <div className={styles.page}>
            <h1>My Basket</h1>
            {error && <div className={styles.error}>{error}</div>}

            <section>
                <h2>Current basket</h2>
                {!draft || draft.items.length === 0 ? (
                    <p>Your basket is empty.</p>
                ) : (
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
                            </thead>
                            <tbody>
                                {draft.items.map(line => {
                                    const it = findItem(line.itemId)
                                    return (
                                        <tr key={line.itemId}>
                                            <td>{it.name}</td>
                                            <td>${Number(it.price).toFixed(2)}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={line.qty}
                                                    onChange={e => updateQty(line, parseInt(e.target.value, 10) || 1)}
                                                    disabled={busy}
                                                    className={styles.qty}
                                                />
                                            </td>
                                            <td>${(Number(it.price) * line.qty).toFixed(2)}</td>
                                            <td>
                                                <button onClick={() => removeLine(line)} disabled={busy} className={styles.remove}>Remove</button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className={styles.totalLabel}><strong>Total:</strong></td>
                                    <td><strong>${basketTotal(draft).toFixed(2)}</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                        <button onClick={submitBasket} disabled={busy} className={styles.submit}>
                            {busy ? 'Submitting...' : 'Submit basket for approval'}
                        </button>
                    </>
                )}
            </section>

            {history.length > 0 && (
                <section>
                    <h2>Order history</h2>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Submitted</th><th>Items</th><th>Total</th><th>Status</th><th>Note</th></tr>
                        </thead>
                        <tbody>
                            {history.map(b => (
                                <tr key={b.id}>
                                    <td>{b.submittedAt ? new Date(b.submittedAt).toLocaleString() : '-'}</td>
                                    <td>{b.items.map(l => `${findItem(l.itemId).name} x${l.qty}`).join(', ')}</td>
                                    <td>${basketTotal(b).toFixed(2)}</td>
                                    <td><span className={styles[`status_${b.status}`]}>{b.status}</span></td>
                                    <td>{b.decisionNote || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}
        </div>
    )
}
