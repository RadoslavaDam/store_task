import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import styles from '../styles/forms.module.css'

export default function LoginPage()
{
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setBusy(true)
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className={styles.formWrap}>
            <h1>Login</h1>
            <form onSubmit={onSubmit} className={styles.form}>
                <label>
                    Email
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </label>
                {error && <div className={styles.error}>{error}</div>}
                <button type="submit" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
                <p>No account? <Link to="/register">Register</Link></p>
            </form>
        </div>
    )
}
