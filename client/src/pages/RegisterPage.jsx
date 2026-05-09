import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import styles from '../styles/forms.module.css'

export default function RegisterPage()
{
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '', name: '', address: '', phone: '' })
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    function update(field) {
        return (e) => setForm(s => ({ ...s, [field]: e.target.value }))
    }

    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setBusy(true)
        try {
            await register({ ...form, role: 'client' })
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className={styles.formWrap}>
            <h1>Register</h1>
            <form onSubmit={onSubmit} className={styles.form}>
                <label>
                    Email
                    <input type="email" value={form.email} onChange={update('email')} required autoFocus />
                </label>
                <label>
                    Password
                    <input type="password" value={form.password} onChange={update('password')} required minLength={4} />
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
                {error && <div className={styles.error}>{error}</div>}
                <button type="submit" disabled={busy}>{busy ? 'Creating account...' : 'Register'}</button>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    )
}
