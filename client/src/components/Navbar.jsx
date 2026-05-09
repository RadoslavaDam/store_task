import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import styles from '../styles/Navbar.module.css'

export default function Navbar()
{
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    function onLogout() {
        logout()
        navigate('/login')
    }

    return (
        <nav className={styles.nav}>
            <Link to="/" className={styles.brand}>Store</Link>
            <div className={styles.links}>
                {user ? (
                    <>
                        <span className={styles.email}>{user.email}</span>
                        <button onClick={onLogout} className={styles.linkButton}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
