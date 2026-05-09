const path = require('path')
const jsonServer = require('json-server')
const auth = require('json-server-auth')
const jwt = require('jsonwebtoken')

const PRIV_ROLES = ['power', 'master']

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))

server.db = router.db

server.use(jsonServer.defaults())
server.use(jsonServer.bodyParser)

// Decode the JWT payload without signature verification, then look up the
// caller in the db to read their actual role. json-server-auth does not put
// the role into the JWT claims, so we cannot trust the token alone for
// authorization. The token only tells us WHICH user is calling; the role
// comes from the db record.
//
// For a coursework demo, decoding without verifying the signature is fine.
// Production would share JWT_SECRET with json-server-auth via env and use
// jwt.verify(token, secret) instead.
function decodeUser(req) {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return null
    let decoded
    try { decoded = jwt.decode(token) } catch (_) { return null }
    if (!decoded) return null
    const id = decoded.sub || decoded.id
    if (id === undefined || id === null) return null
    const dbUser = router.db.get('users').find({ id: parseInt(id, 10) }).value()
    if (!dbUser) return null
    return { id: dbUser.id, email: dbUser.email, role: dbUser.role || 'client' }
}

// Role-based guards. Runs before json-server-auth so we can reject early
// or short-circuit reads that the default rules would otherwise block.
server.use((req, res, next) => {
    const url = req.url
    const method = req.method
    const body = req.body
    const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

    // Admin read of /baskets bypasses json-server-auth's owner-only 660 rule.
    // Our power/master roles are not json-server-auth admins (different role
    // naming on purpose), so we serve admin reads here directly from the db.
    if (method === 'GET' && /^\/baskets(\/\d+)?(\?.*)?$/.test(url)) {
        const user = decodeUser(req)
        if (user && PRIV_ROLES.includes(user.role)) {
            const query = req.query || {}
            const idMatch = url.match(/^\/baskets\/(\d+)/)
            if (idMatch) {
                const found = router.db.get('baskets').find({ id: parseInt(idMatch[1], 10) }).value()
                if (!found) return res.status(404).json({ error: 'Not found' })
                return res.json(found)
            }
            let result = router.db.get('baskets').value()
            if (query.status) result = result.filter(b => b.status === query.status)
            if (query.userId !== undefined) result = result.filter(b => String(b.userId) === String(query.userId))
            return res.json(result)
        }
    }

    if (url.startsWith('/items') && writeMethods.has(method)) {
        const user = decodeUser(req)
        if (!user || !PRIV_ROLES.includes(user.role)) {
            return res.status(403).json({ error: 'Admin role required' })
        }
    }

    if (/^\/baskets\/\d+/.test(url) && method === 'PATCH' && body && body.status !== undefined) {
        const user = decodeUser(req)
        if (!user || !PRIV_ROLES.includes(user.role)) {
            return res.status(403).json({ error: 'Admin role required to change basket status' })
        }
    }

    if ((url === '/users' || url === '/signup' || url === '/register') && method === 'POST' && body) {
        const requestedRole = body.role || 'client'
        if (requestedRole === 'master') {
            const masterExists = router.db.get('users').find({ role: 'master' }).value()
            if (masterExists) {
                return res.status(403).json({ error: 'Master already exists' })
            }
        } else if (requestedRole === 'power') {
            const user = decodeUser(req)
            if (!user || user.role !== 'master') {
                return res.status(403).json({ error: 'Only master can create admin users' })
            }
        }
    }

    if (/^\/users\/\d+$/.test(url) && method === 'DELETE') {
        const user = decodeUser(req)
        if (!user || user.role !== 'master') {
            return res.status(403).json({ error: 'Master role required' })
        }
    }

    next()
})

server.use(auth.rewriter(require('./routes.json')))
server.use(auth)
server.use(router)

const PORT = 3001
server.listen(PORT, () => {
    console.log(`Store API listening on http://localhost:${PORT}`)
})
