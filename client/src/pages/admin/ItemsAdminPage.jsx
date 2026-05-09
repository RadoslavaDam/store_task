import { useEffect, useState } from 'react'
import { listItems, createItem, patchItem, deleteItem } from '../../api/items'
import styles from '../../styles/Admin.module.css'

const EMPTY = { name: '', description: '', price: '', stock: '', imageUrl: '' }

export default function ItemsAdminPage()
{
    const [items, setItems] = useState([])
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    function load() {
        return listItems().then(setItems)
    }

    useEffect(() => {
        load()
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    function startEdit(item) {
        setEditing(item.id)
        setForm({
            name: item.name,
            description: item.description,
            price: String(item.price),
            stock: String(item.stock),
            imageUrl: item.imageUrl || ''
        })
    }

    function startNew() {
        setEditing('new')
        setForm(EMPTY)
    }

    function cancel() {
        setEditing(null)
        setForm(EMPTY)
    }

    function update(field) {
        return e => setForm(s => ({ ...s, [field]: e.target.value }))
    }

    async function save(e) {
        e.preventDefault()
        setBusy(true)
        setError('')
        try {
            const payload = {
                name: form.name,
                description: form.description,
                price: parseFloat(form.price) || 0,
                stock: parseInt(form.stock, 10) || 0,
                imageUrl: form.imageUrl
            }
            if (editing === 'new') {
                await createItem(payload)
            } else {
                await patchItem(editing, payload)
            }
            await load()
            cancel()
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    async function remove(id) {
        if (!window.confirm('Delete this item?')) return
        setBusy(true)
        setError('')
        try {
            await deleteItem(id)
            await load()
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    if (loading) return <div className={styles.page}><p>Loading items...</p></div>

    return (
        <div className={styles.page}>
            <h1>Items</h1>
            {error && <div className={styles.error}>{error}</div>}

            {editing !== null ? (
                <form onSubmit={save} className={styles.editForm}>
                    <h2>{editing === 'new' ? 'New item' : 'Edit item'}</h2>
                    <label>Name<input type="text" value={form.name} onChange={update('name')} required /></label>
                    <label>Description<textarea value={form.description} onChange={update('description')} rows={3} /></label>
                    <label>Price<input type="number" step="0.01" min="0" value={form.price} onChange={update('price')} required /></label>
                    <label>Stock<input type="number" min="0" value={form.stock} onChange={update('stock')} required /></label>
                    <label>Image URL<input type="url" value={form.imageUrl} onChange={update('imageUrl')} /></label>
                    <div className={styles.formActions}>
                        <button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
                        <button type="button" onClick={cancel} className={styles.secondary}>Cancel</button>
                    </div>
                </form>
            ) : (
                <button onClick={startNew} className={styles.primary}>+ New item</button>
            )}

            <table className={styles.table}>
                <thead>
                    <tr><th>Name</th><th>Price</th><th>Stock</th><th></th></tr>
                </thead>
                <tbody>
                    {items.map(it => (
                        <tr key={it.id}>
                            <td>{it.name}</td>
                            <td>${Number(it.price).toFixed(2)}</td>
                            <td>{it.stock}</td>
                            <td>
                                <button onClick={() => startEdit(it)} disabled={busy}>Edit</button>
                                <button onClick={() => remove(it.id)} disabled={busy} className={styles.danger}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
