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

    const isAdmin = user && (user.role === 'power' || user.role === 'master')
    const isMaster = user && user.role === 'master'
    const isClient = user && user.role === 'client'

    return (
        <nav className={styles.nav}>
            <Link to="/" className={styles.brand}>Store</Link>
            <div className={styles.links}>
                {!user && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
                {isClient && (
                    <>
                        <Link to="/store">Store</Link>
                        <Link to="/basket">Basket</Link>
                        <Link to="/profile">Profile</Link>
                    </>
                )}
                {isAdmin && (
                    <>
                        <Link to="/admin/items">Items</Link>
                        <Link to="/admin/baskets">Baskets</Link>
                    </>
                )}
                {isMaster && <Link to="/admin/users">Users</Link>}
                {user && (
                    <>
                        <span className={styles.email}>{user.email}</span>
                        <button onClick={onLogout} className={styles.linkButton}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    )
}
