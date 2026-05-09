import { useEffect, useState } from 'react'
import { listItems } from '../api/items'
import ItemCard from '../components/ItemCard'
import styles from '../styles/Store.module.css'

export default function StorePage()
{
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        listItems()
            .then(setItems)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className={styles.page}><p>Loading items...</p></div>
    if (error) return <div className={styles.page}><p>Error: {error}</p></div>

    return (
        <div className={styles.page}>
            <h1>Store</h1>
            {items.length === 0 ? (
                <p>No items available.</p>
            ) : (
                <div className={styles.grid}>
                    {items.map(item => <ItemCard key={item.id} item={item} />)}
                </div>
            )}
        </div>
    )
}
