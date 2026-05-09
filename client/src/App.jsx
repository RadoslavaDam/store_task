import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StorePage from './pages/StorePage'
import ProtectedRoute from './auth/ProtectedRoute'
import { useAuth } from './auth/AuthContext'

function HomeRedirect()
{
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (user.role === 'master' || user.role === 'power') return <Navigate to="/admin/items" replace />
    return <Navigate to="/store" replace />
}

function Placeholder({ title })
{
    return (
        <div style={{ padding: 24 }}>
            <h1>{title}</h1>
            <p>Coming soon.</p>
        </div>
    )
}

export default function App()
{
    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/store" element={<ProtectedRoute roles={['client']}><StorePage /></ProtectedRoute>} />
                    <Route path="/basket" element={<ProtectedRoute roles={['client']}><Placeholder title="Basket" /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute roles={['client']}><Placeholder title="Profile" /></ProtectedRoute>} />

                    <Route path="/admin/items" element={<ProtectedRoute roles={['power', 'master']}><Placeholder title="Admin: Items" /></ProtectedRoute>} />
                    <Route path="/admin/baskets" element={<ProtectedRoute roles={['power', 'master']}><Placeholder title="Admin: Baskets" /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute roles={['master']}><Placeholder title="Admin: Users" /></ProtectedRoute>} />

                    <Route path="*" element={<Placeholder title="Not Found" />} />
                </Routes>
            </main>
        </>
    )
}
