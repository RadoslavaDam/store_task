import { useEffect, useState } from 'react'
import { getUser, patchUser } from '../api/users'
import { useAuth } from '../auth/AuthContext'
import styles from '../styles/forms.module.css'

export default function ProfilePage()
{
    const { user } = useAuth()
    const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' })
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        getUser(user.id)
            .then(u => setForm({
                name: u.name || '',
                address: u.address || '',
                phone: u.phone || '',
                email: u.email || ''
            }))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [user.id])

    function update(field) {
        return e => setForm(s => ({ ...s, [field]: e.target.value }))
    }

    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setMessage('')
        setBusy(true)
        try {
            const payload = {
                name: form.name,
                address: form.address,
                phone: form.phone
            }
            if (password) payload.password = password
            await patchUser(user.id, payload)
            setMessage('Profile updated.')
            setPassword('')
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    if (loading) return <div className={styles.formWrap}><p>Loading...</p></div>

    return (
        <div className={styles.formWrap}>
            <h1>My Profile</h1>
            <form onSubmit={onSubmit} className={styles.form}>
                <label>
                    Email
                    <input type="email" value={form.email} disabled />
                </label>
                <label>
                    Full name
                    <input type="text" value={form.name} onChange={update('name')} required />
                </label>
                <label>
                    Address
                    <input type="text" value={form.address} onChange={update('address')} />
                </label>
                <label>
                    Phone
                    <input type="tel" value={form.phone} onChange={update('phone')} />
                </label>
                <label>
                    New password (leave blank to keep current)
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={password ? 4 : 0}
                    />
                </label>
                {error && <div className={styles.error}>{error}</div>}
                {message && <div className={styles.notice}>{message}</div>}
                <button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
            </form>
        </div>
    )
}
