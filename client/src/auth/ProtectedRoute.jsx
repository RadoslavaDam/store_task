import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ children, roles })
{
    const { user } = useAuth()
    const location = useLocation()

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (roles && roles.length && !roles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return children
}
