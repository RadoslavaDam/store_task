import { Link } from 'react-router-dom'
import styles from '../styles/Navbar.module.css'

export default function Navbar()
{
    return (
        <nav className={styles.nav}>
            <Link to="/" className={styles.brand}>Store</Link>
            <div className={styles.links}>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </div>
        </nav>
    )
}
