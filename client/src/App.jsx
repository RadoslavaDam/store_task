import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

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
                    <Route path="/" element={<Placeholder title="Home" />} />
                    <Route path="/login" element={<Placeholder title="Login" />} />
                    <Route path="/register" element={<Placeholder title="Register" />} />
                    <Route path="/store" element={<Placeholder title="Store" />} />
                    <Route path="/basket" element={<Placeholder title="Basket" />} />
                    <Route path="/profile" element={<Placeholder title="Profile" />} />
                    <Route path="/admin/items" element={<Placeholder title="Admin: Items" />} />
                    <Route path="/admin/baskets" element={<Placeholder title="Admin: Baskets" />} />
                    <Route path="/admin/users" element={<Placeholder title="Admin: Users" />} />
                    <Route path="*" element={<Placeholder title="Not Found" />} />
                </Routes>
            </main>
        </>
    )
}
