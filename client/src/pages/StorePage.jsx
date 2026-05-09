import { useEffect, useState } from 'react'
import { listItems } from '../api/items'
import { addToBasket } from '../api/baskets'
import { useAuth } from '../auth/AuthContext'
import ItemCard from '../components/ItemCard'
import styles from '../styles/Store.module.css'

export default function StorePage()
{
    const { user } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busyItemId, setBusyItemId] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        listItems()
            .then(setItems)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    async function onAdd(item) {
        setBusyItemId(item.id)
        setMessage('')
        setError('')
        try {
            await addToBasket(user.id, item.id, 1)
            setMessage(`Added "${item.name}" to basket.`)
        } catch (err) {
            setError(err.message)
        } finally {
            setBusyItemId(null)
        }
    }

    if (loading) return <div className={styles.page}><p>Loading items...</p></div>
    if (error && items.length === 0) return <div className={styles.page}><p>Error: {error}</p></div>

    return (
        <div className={styles.page}>
            <h1>Store</h1>
            {message && <div className={styles.message}>{message}</div>}
            {error && <div className={styles.error}>{error}</div>}
            {items.length === 0 ? (
                <p>No items available.</p>
            ) : (
                <div className={styles.grid}>
                    {items.map(item => (
                        <ItemCard key={item.id} item={item}>
                            <button
                                className={styles.addButton}
                                disabled={busyItemId === item.id || item.stock < 1}
                                onClick={() => onAdd(item)}
                            >
                                {item.stock < 1 ? 'Out of stock' : busyItemId === item.id ? 'Adding...' : 'Add to basket'}
                            </button>
                        </ItemCard>
                    ))}
                </div>
            )}
        </div>
    )
}
