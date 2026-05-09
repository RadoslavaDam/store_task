import { useEffect, useState } from 'react'
import { listUsers, deleteUser } from '../../api/users'
import { register as registerUser } from '../../api/auth'
import { useAuth } from '../../auth/AuthContext'
import styles from '../../styles/Admin.module.css'

const EMPTY = { email: '', password: '', name: '', address: '', phone: '' }

export default function UsersAdminPage()
{
    const { user: me } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState('')

    function load() {
        return listUsers().then(setUsers)
    }

    useEffect(() => {
        load().catch(err => setError(err.message)).finally(() => setLoading(false))
    }, [])

    function update(field) {
        return e => setForm(s => ({ ...s, [field]: e.target.value }))
    }

    async function createPowerUser(e) {
        e.preventDefault()
        setBusy(true)
        setError('')
        setMessage('')
        try {
            // Calls /register with role=power. Master's JWT is attached by the
            // api wrapper, the server middleware lets it through because the
            // caller is master. The returned accessToken (for the new user) is
            // discarded; master's session continues unchanged.
            await registerUser({ ...form, role: 'power' })
            setMessage(`Power user ${form.email} created.`)
            setForm(EMPTY)
            setCreating(false)
            await load()
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    async function remove(u) {
        if (u.id === me.id) {
            setError('You cannot delete your own master account.')
            return
        }
        if (!window.confirm(`Delete user ${u.email}?`)) return
        setBusy(true)
        setError('')
        try {
            await deleteUser(u.id)
            await load()
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    if (loading) return <div className={styles.page}><p>Loading users...</p></div>

    return (
        <div className={styles.page}>
            <h1>Users</h1>
            {error && <div className={styles.error}>{error}</div>}
            {message && <div className={styles.notice}>{message}</div>}

            {creating ? (
                <form onSubmit={createPowerUser} className={styles.editForm}>
                    <h2>New administrator</h2>
                    <label>Email<input type="email" value={form.email} onChange={update('email')} required /></label>
                    <label>Password<input type="password" value={form.password} onChange={update('password')} required minLength={4} /></label>
                    <label>Full name<input type="text" value={form.name} onChange={update('name')} required /></label>
                    <label>Address<input type="text" value={form.address} onChange={update('address')} /></label>
                    <label>Phone<input type="tel" value={form.phone} onChange={update('phone')} /></label>
                    <div className={styles.formActions}>
                        <button type="submit" disabled={busy}>{busy ? 'Creating...' : 'Create'}</button>
                        <button type="button" className={styles.secondary} onClick={() => { setCreating(false); setForm(EMPTY) }}>Cancel</button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setCreating(true)} className={styles.primary}>+ New administrator</button>
            )}

            <table className={styles.table}>
                <thead>
                    <tr><th>Email</th><th>Name</th><th>Role</th><th></th></tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.email}</td>
                            <td>{u.name || '-'}</td>
                            <td><span className={styles[`role_${u.role || 'client'}`]}>{u.role || 'client'}</span></td>
                            <td>
                                {u.id !== me.id ? (
                                    <button onClick={() => remove(u)} disabled={busy} className={styles.danger}>Delete</button>
                                ) : (
                                    <span style={{ color: '#888', fontSize: 13 }}>(you)</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
