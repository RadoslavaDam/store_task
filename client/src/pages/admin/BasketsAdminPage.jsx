import { useEffect, useState } from 'react'
import { listBaskets, patchBasket } from '../../api/baskets'
import { listItems } from '../../api/items'
import { listUsers } from '../../api/users'
import { useAuth } from '../../auth/AuthContext'
import styles from '../../styles/Admin.module.css'

export default function BasketsAdminPage()
{
    const { user } = useAuth()
    const [baskets, setBaskets] = useState([])
    const [items, setItems] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busyId, setBusyId] = useState(null)
    const [notes, setNotes] = useState({})

    function load() {
        return Promise.all([listBaskets(), listItems(), listUsers()]).then(([bs, it, us]) => {
            setBaskets(bs)
            setItems(it)
            setUsers(us)
        })
    }

    useEffect(() => {
        load().catch(err => setError(err.message)).finally(() => setLoading(false))
    }, [])

    function findItem(itemId) {
        return items.find(i => i.id === itemId) || { name: `Item #${itemId}`, price: 0 }
    }

    function findUser(userId) {
        return users.find(u => u.id === userId) || { email: `User #${userId}`, name: '' }
    }

    function basketTotal(basket) {
        return basket.items.reduce((sum, line) => {
            const it = findItem(line.itemId)
            return sum + (Number(it.price) || 0) * line.qty
        }, 0)
    }

    async function decide(basket, status) {
        setBusyId(basket.id)
        setError('')
        try {
            await patchBasket(basket.id, {
                status,
                decidedAt: new Date().toISOString(),
                decidedBy: user.id,
                decisionNote: notes[basket.id] || ''
            })
            await load()
            setNotes(n => ({ ...n, [basket.id]: '' }))
        } catch (err) {
            setError(err.message)
        } finally {
            setBusyId(null)
        }
    }

    if (loading) return <div className={styles.page}><p>Loading baskets...</p></div>

    const submitted = baskets
        .filter(b => b.status === 'submitted')
        .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
    const decided = baskets
        .filter(b => b.status === 'approved' || b.status === 'rejected')
        .sort((a, b) => (b.decidedAt || '').localeCompare(a.decidedAt || ''))

    return (
        <div className={styles.page}>
            <h1>Basket review</h1>
            {error && <div className={styles.error}>{error}</div>}

            <h2>Pending approval</h2>
            {submitted.length === 0 ? (
                <p>No baskets awaiting approval.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr><th>Submitted</th><th>Customer</th><th>Items</th><th>Total</th><th>Decision</th></tr>
                    </thead>
                    <tbody>
                        {submitted.map(b => {
                            const customer = findUser(b.userId)
                            return (
                                <tr key={b.id}>
                                    <td>{b.submittedAt ? new Date(b.submittedAt).toLocaleString() : '-'}</td>
                                    <td>{customer.name || customer.email}<br /><small>{customer.email}</small></td>
                                    <td>
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {b.items.map(line => (
                                                <li key={line.itemId}>{findItem(line.itemId).name} x{line.qty}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>${basketTotal(b).toFixed(2)}</td>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="Note (optional)"
                                            value={notes[b.id] || ''}
                                            onChange={e => setNotes(n => ({ ...n, [b.id]: e.target.value }))}
                                            style={{ width: '100%', padding: 4, marginBottom: 4 }}
                                        />
                                        <div className={styles.row}>
                                            <button onClick={() => decide(b, 'approved')} disabled={busyId === b.id}>Approve</button>
                                            <button onClick={() => decide(b, 'rejected')} disabled={busyId === b.id} className={styles.danger}>Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}

            <h2 style={{ marginTop: 32 }}>Recent decisions</h2>
            {decided.length === 0 ? (
                <p>No past decisions.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr><th>Decided</th><th>Customer</th><th>Status</th><th>Total</th><th>Note</th></tr>
                    </thead>
                    <tbody>
                        {decided.slice(0, 20).map(b => {
                            const customer = findUser(b.userId)
                            return (
                                <tr key={b.id}>
                                    <td>{b.decidedAt ? new Date(b.decidedAt).toLocaleString() : '-'}</td>
                                    <td>{customer.name || customer.email}</td>
                                    <td><span className={styles[`status_${b.status}`]}>{b.status}</span></td>
                                    <td>${basketTotal(b).toFixed(2)}</td>
                                    <td>{b.decisionNote || '-'}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}
